const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    coverImage: {
      type: String,
      default: null,
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'draft',
    },
    rejectionReason: {
      type: String,
    },
    eventType: {
      type: String,
      enum: ['in-person', 'online', 'hybrid'],
      default: 'in-person',
    },
    venue: {
      name: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      onlineLink: { type: String },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    startTime: { type: String },
    endTime: { type: String },
    timezone: { type: String, default: 'UTC' },
    ticketTypes: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        sold: { type: Number, default: 0 },
        description: { type: String },
        isActive: { type: Boolean, default: true },
      },
    ],
    isFree: {
      type: Boolean,
      default: false,
    },
    maxAttendees: {
      type: Number,
      min: 1,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    allowCancellation: {
      type: Boolean,
      default: true,
    },
    cancellationDeadline: {
      type: Date,
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    ageRestriction: {
      type: Number,
      default: 0,
    },
    dress_code: { type: String },
    agenda: [
      {
        time: { type: String },
        title: { type: String },
        description: { type: String },
        speaker: { type: String },
      },
    ],
    speakers: [
      {
        name: { type: String },
        bio: { type: String },
        photo: { type: String },
        designation: { type: String },
      },
    ],
    sponsors: [
      {
        name: { type: String },
        logo: { type: String },
        website: { type: String },
        tier: { type: String, enum: ['gold', 'silver', 'bronze', 'partner'] },
      },
    ],
    budget: {
      total: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      expenses: [
        {
          title: { type: String },
          amount: { type: Number },
          category: { type: String },
          date: { type: Date },
          notes: { type: String },
        },
      ],
    },
    analytics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      favorites: { type: Number, default: 0 },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate slug
eventSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') +
      '-' +
      Date.now();
  }
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);

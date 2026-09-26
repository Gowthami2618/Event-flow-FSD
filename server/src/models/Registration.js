const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketType: {
      name: { type: String },
      price: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'attended', 'no-show'],
      default: 'confirmed',
    },
    ticketCode: {
      type: String,
      unique: true,
    },
    qrData: {
      type: String,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'paid', 'refunded', 'pending'],
      default: 'free',
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    attendeeDetails: {
      name: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// Generate ticket code before save
registrationSchema.pre('save', function () {
  if (!this.ticketCode) {
    this.ticketCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    this.qrData = JSON.stringify({
      ticketCode: this.ticketCode,
      eventId: this.event,
      attendeeId: this.attendee,
    });
  }
});

// Prevent duplicate registration
registrationSchema.index({ event: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);

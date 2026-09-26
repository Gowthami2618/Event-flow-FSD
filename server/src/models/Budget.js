const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required for budget'],
      unique: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      default: 0,
      min: [0, 'Budget cannot be negative'],
    },
    allocatedBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'closed'],
      default: 'active',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ event: 1 });
budgetSchema.index({ organizer: 1 });

module.exports = mongoose.model('Budget', budgetSchema);

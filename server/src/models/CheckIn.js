const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required for check-in'],
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Attendee is required for check-in'],
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    ticketCode: {
      type: String,
      required: [true, 'Ticket code is required for check-in'],
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff/Organizer user is required for check-in'],
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
    checkInMethod: {
      type: String,
      enum: ['qr_scan', 'manual', 'code_entry'],
      default: 'qr_scan',
    },
    device: {
      type: String,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

checkInSchema.index({ event: 1, attendee: 1 });
checkInSchema.index({ ticketCode: 1 });
checkInSchema.index({ checkedInAt: -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);

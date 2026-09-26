const mongoose = require('mongoose');
const crypto = require('crypto');

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required for ticket'],
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Attendee is required for ticket'],
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
    },
    ticketType: {
      name: { type: String, required: true, default: 'General Admission' },
      price: { type: Number, required: true, default: 0, min: 0 },
      description: { type: String },
    },
    ticketCode: {
      type: String,
      unique: true,
      required: true,
    },
    qrData: {
      type: String,
    },
    status: {
      type: String,
      enum: ['valid', 'used', 'cancelled', 'refunded'],
      default: 'valid',
    },
    isCheckedIn: {
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
    seatNumber: {
      type: String,
    },
    pricePaid: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique ticket code and QR payload before validation
ticketSchema.pre('validate', function () {
  if (!this.ticketCode) {
    this.ticketCode = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    this.qrData = JSON.stringify({
      ticketCode: this.ticketCode,
      eventId: this.event,
      attendeeId: this.attendee,
    });
  }
});

ticketSchema.index({ ticketCode: 1 });
ticketSchema.index({ event: 1, attendee: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);

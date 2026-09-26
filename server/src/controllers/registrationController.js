const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const logAction = require('../utils/auditLogger');

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Attendee)
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event || event.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Event not found or not available.' });
    }

    // Check capacity
    if (event.maxAttendees && event.registeredCount >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
    }

    // Check event hasn't started
    if (new Date(event.startDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Event has already started.' });
    }

    // Check already registered
    const existing = await Registration.findOne({ event: event._id, attendee: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this event.' });
    }

    const { ticketTypeName } = req.body;
    let ticketType = { name: 'General', price: 0 };
    if (ticketTypeName && event.ticketTypes.length > 0) {
      const found = event.ticketTypes.find((t) => t.name === ticketTypeName && t.isActive);
      if (!found) return res.status(400).json({ success: false, message: 'Ticket type not found.' });
      if (found.sold >= found.quantity) return res.status(400).json({ success: false, message: 'Ticket type sold out.' });
      ticketType = { name: found.name, price: found.price };
      found.sold += 1;
      await event.save();
    }

    const registration = await Registration.create({
      event: event._id,
      attendee: req.user._id,
      ticketType,
      paymentStatus: ticketType.price === 0 ? 'free' : 'paid',
      paymentAmount: ticketType.price,
      attendeeDetails: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      },
    });

    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });

    // Send notification to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        notifications: {
          message: `You have successfully registered for "${event.title}"`,
          type: 'success',
        },
      },
    });

    await logAction({
      user: req.user,
      action: 'EVENT_REGISTRATION',
      resource: 'Registration',
      resourceId: registration._id,
      details: { eventId: event._id, eventTitle: event.title },
      req,
    });

    res.status(201).json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   PUT /api/registrations/:id/cancel
// @access  Private (Attendee)
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    if (registration.attendee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (!registration.event.allowCancellation) {
      return res.status(400).json({ success: false, message: 'Cancellations not allowed for this event.' });
    }

    if (registration.event.cancellationDeadline && new Date() > registration.event.cancellationDeadline) {
      return res.status(400).json({ success: false, message: 'Cancellation deadline has passed.' });
    }

    registration.status = 'cancelled';
    registration.cancellationReason = req.body.reason;
    registration.cancelledAt = new Date();
    await registration.save();

    await Event.findByIdAndUpdate(registration.event._id, { $inc: { registeredCount: -1 } });

    res.status(200).json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/my
// @access  Private (Attendee)
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { attendee: req.user._id };
    if (status) query.status = status;

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .populate({
        path: 'event',
        populate: [
          { path: 'organizer', select: 'name organization' },
          { path: 'category', select: 'name' },
        ],
      })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: registrations.length, total, registrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket/QR details
// @route   GET /api/registrations/:id/ticket
// @access  Private (Attendee)
const getTicket = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title startDate endDate venue coverImage organizer')
      .populate('attendee', 'name email');

    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });

    if (registration.attendee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.status(200).json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in attendee by ticket code (Organizer scans QR)
// @route   PUT /api/registrations/checkin
// @access  Private (Organizer)
const checkInAttendee = async (req, res, next) => {
  try {
    const { ticketCode, eventId } = req.body;

    const registration = await Registration.findOne({ ticketCode, event: eventId })
      .populate('attendee', 'name email avatar')
      .populate('event', 'title organizer');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Invalid ticket code.' });
    }

    if (registration.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to check in for this event.' });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ success: false, message: 'Attendee already checked in.', registration });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This registration was cancelled.' });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.checkedInBy = req.user._id;
    registration.status = 'attended';
    await registration.save();

    res.status(200).json({ success: true, message: 'Check-in successful!', registration });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerForEvent, cancelRegistration, getMyRegistrations, getTicket, checkInAttendee };

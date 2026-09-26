const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Category = require('../models/Category');
const logAction = require('../utils/auditLogger');

// @desc    Get all public/approved events (with search, filter, pagination)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      eventType,
      isFree,
      city,
      startDate,
      endDate,
      sort = '-createdAt',
    } = req.query;

    const query = { status: 'approved', isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (eventType) query.eventType = eventType;
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (city) query['venue.city'] = { $regex: city, $options: 'i' };
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { ...query.endDate, $lte: new Date(endDate) };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name avatar organization')
      .populate('category', 'name slug color icon')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by slug or id
// @route   GET /api/events/:idOrSlug
// @access  Public
const getEvent = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let event;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(idOrSlug);
    } else {
      event = await Event.findOne({ slug: idOrSlug });
    }

    if (!event || (event.status !== 'approved' && (!req.user || req.user.role === 'attendee'))) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await Event.findByIdAndUpdate(event._id, { $inc: { 'analytics.views': 1 } });

    await event.populate('organizer', 'name avatar organization bio');
    await event.populate('category', 'name slug color icon');
    await event.populate('approvedBy', 'name');

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event (organizer)
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body, organizer: req.user._id };

    if (req.file) {
      eventData.coverImage = `/uploads/events/${req.file.filename}`;
    }

    const event = await Event.create(eventData);

    await logAction({
      user: req.user,
      action: 'EVENT_CREATED',
      resource: 'Event',
      resourceId: event._id,
      details: { title: event.title, status: event.status },
      req,
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (organizer - own events only)
// @route   PUT /api/events/:id
// @access  Private (Organizer)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this event.' });
    }

    if (req.file) {
      req.body.coverImage = `/uploads/events/${req.file.filename}`;
    }

    // If event was approved and organizer edits, reset to pending
    if (event.status === 'approved') {
      req.body.status = 'pending';
      req.body.submittedAt = new Date();
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await logAction({
      user: req.user,
      action: 'EVENT_UPDATED',
      resource: 'Event',
      resourceId: event._id,
      req,
    });

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event (organizer - own events only, or admin)
// @route   DELETE /api/events/:id
// @access  Private (Organizer | Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ event: req.params.id });

    await logAction({
      user: req.user,
      action: 'EVENT_DELETED',
      resource: 'Event',
      resourceId: req.params.id,
      details: { title: event.title },
      req,
    });

    res.status(200).json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit event for approval
// @route   PUT /api/events/:id/submit
// @access  Private (Organizer)
const submitEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (!['draft', 'rejected'].includes(event.status)) {
      return res.status(400).json({ success: false, message: `Event cannot be submitted from status: ${event.status}` });
    }

    event.status = 'pending';
    event.submittedAt = new Date();
    await event.save();

    res.status(200).json({ success: true, message: 'Event submitted for approval.', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer's own events
// @route   GET /api/events/my-events
// @access  Private (Organizer)
const getMyEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { organizer: req.user._id };
    if (status) query.status = status;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('category', 'name slug')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: events.length, total, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event attendees (organizer)
// @route   GET /api/events/:id/attendees
// @access  Private (Organizer | Admin)
const getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate('attendee', 'name email avatar phone')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event analytics (organizer)
// @route   GET /api/events/:id/analytics
// @access  Private (Organizer)
const getEventAnalytics = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const registrations = await Registration.find({ event: req.params.id });
    const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
    const cancelled = registrations.filter((r) => r.status === 'cancelled').length;
    const attended = registrations.filter((r) => r.checkedIn).length;

    // Registrations over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegs = await Registration.aggregate([
      { $match: { event: event._id, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        ...event.analytics.toObject(),
        registrations: { total: registrations.length, confirmed, cancelled, attended },
        revenue: registrations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0),
        registrationsOverTime: recentRegs,
        capacity: event.maxAttendees || null,
        occupancyRate: event.maxAttendees ? Math.round((confirmed / event.maxAttendees) * 100) : null,
        budget: event.budget,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Update budget expense
// @route   POST /api/events/:id/budget/expenses
// @access  Private (Organizer)
const addExpense = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    event.budget.expenses.push(req.body);
    event.budget.spent = event.budget.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    await event.save();

    res.status(201).json({ success: true, budget: event.budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget expense
// @route   DELETE /api/events/:id/budget/expenses/:expenseId
// @access  Private (Organizer)
const deleteExpense = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    event.budget.expenses = event.budget.expenses.filter(
      (e) => e._id.toString() !== req.params.expenseId
    );
    event.budget.spent = event.budget.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    await event.save();

    res.status(200).json({ success: true, budget: event.budget });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEvent,
  getMyEvents,
  getEventAttendees,
  getEventAnalytics,
  addExpense,
  deleteExpense,
};

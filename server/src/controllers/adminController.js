const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');
const logAction = require('../utils/auditLogger');

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalRegistrations, pendingEvents, totalCategories] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Registration.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Category.countDocuments(),
    ]);

    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const eventsByStatus = await Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    // Registration trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const regTrend = await Registration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Recent activity
    const recentLogs = await AuditLog.find().populate('user', 'name role').sort('-createdAt').limit(10);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalEvents, totalRegistrations, pendingEvents, totalCategories },
      usersByRole,
      eventsByStatus,
      regTrend,
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with filter/search/pagination)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isSuspended } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isSuspended !== undefined) query.isSuspended = isSuspended === 'true';
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));

    res.status(200).json({ success: true, count: users.length, total, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
const toggleSuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend admin accounts.' });
    }

    user.isSuspended = !user.isSuspended;
    user.suspendedReason = user.isSuspended ? req.body.reason : null;
    await user.save();

    await logAction({
      user: req.user,
      action: user.isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      resource: 'User',
      resourceId: user._id,
      details: { reason: req.body.reason },
      req,
    });

    res.status(200).json({
      success: true,
      message: user.isSuspended ? 'User suspended.' : 'User reinstated.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin accounts.' });
    }

    await User.findByIdAndDelete(req.params.id);
    await logAction({
      user: req.user,
      action: 'USER_DELETED',
      resource: 'User',
      resourceId: req.params.id,
      details: { name: user.name, email: user.email },
      req,
    });

    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
// @access  Private (Admin)
const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .populate('category', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: events.length, total, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve event
// @route   PUT /api/admin/events/:id/approve
// @access  Private (Admin)
const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    event.status = 'approved';
    event.approvedAt = new Date();
    event.approvedBy = req.user._id;
    event.rejectionReason = null;
    await event.save();

    // Notify organizer
    await User.findByIdAndUpdate(event.organizer._id, {
      $push: {
        notifications: {
          message: `Your event "${event.title}" has been approved and is now live!`,
          type: 'success',
        },
      },
    });

    await logAction({
      user: req.user,
      action: 'EVENT_APPROVED',
      resource: 'Event',
      resourceId: event._id,
      details: { title: event.title },
      req,
    });

    res.status(200).json({ success: true, message: 'Event approved.', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject event
// @route   PUT /api/admin/events/:id/reject
// @access  Private (Admin)
const rejectEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    event.status = 'rejected';
    event.rejectionReason = req.body.reason;
    await event.save();

    await User.findByIdAndUpdate(event.organizer._id, {
      $push: {
        notifications: {
          message: `Your event "${event.title}" was rejected. Reason: ${req.body.reason}`,
          type: 'error',
        },
      },
    });

    await logAction({
      user: req.user,
      action: 'EVENT_REJECTED',
      resource: 'Event',
      resourceId: event._id,
      details: { title: event.title, reason: req.body.reason },
      req,
    });

    res.status(200).json({ success: true, message: 'Event rejected.', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Feature/unfeature event
// @route   PUT /api/admin/events/:id/feature
// @access  Private (Admin)
const toggleFeatureEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    event.isFeatured = !event.isFeatured;
    await event.save();
    res.status(200).json({ success: true, isFeatured: event.isFeatured, message: event.isFeatured ? 'Event featured.' : 'Event unfeatured.' });
  } catch (error) {
    next(error);
  }
};

// Category management
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

// Audit logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: logs.length, total, logs });
  } catch (error) {
    next(error);
  }
};

// Platform analytics
const getPlatformAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsers,
      newEvents,
      topEvents,
      categoryStats,
    ] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Event.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Event.find({ status: 'approved' }).sort('-registeredCount').limit(10).select('title registeredCount averageRating'),
      Event.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalRegistrations: { $sum: '$registeredCount' } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$cat.name', 'Uncategorized'] }, count: 1, totalRegistrations: 1 } },
      ]),
    ]);

    res.status(200).json({ success: true, newUsers, newEvents, topEvents, categoryStats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  toggleSuspendUser,
  deleteUser,
  getAllEvents,
  approveEvent,
  rejectEvent,
  toggleFeatureEvent,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAuditLogs,
  getPlatformAnalytics,
};

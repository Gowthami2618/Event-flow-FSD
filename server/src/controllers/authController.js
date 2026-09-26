const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const logAction = require('../utils/auditLogger');

// @desc    Register user (attendee or organizer only)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // CRITICAL: Prevent admin self-registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created through public registration.',
      });
    }

    const allowedRoles = ['attendee', 'organizer'];
    const userRole = allowedRoles.includes(role) ? role : 'attendee';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const { phone, organization } = req.body;
    const user = await User.create({ name, email, password, role: userRole, phone, organization });

    await logAction({ user, action: 'USER_REGISTERED', resource: 'User', resourceId: user._id, req });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account suspended. ${user.suspendedReason || 'Contact support.'}`,
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await logAction({ user, action: 'USER_LOGIN', resource: 'User', resourceId: user._id, req });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, organization } = req.body;
    const updateData = { name, phone, bio, organization };

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    await logAction({ user, action: 'PASSWORD_CHANGED', resource: 'User', resourceId: user._id, req });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/auth/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.status(200).json({ success: true, notifications: user.notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/auth/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.id },
      { $set: { 'notifications.$.isRead': true } }
    );
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, updateProfile, changePassword, getNotifications, markNotificationRead };

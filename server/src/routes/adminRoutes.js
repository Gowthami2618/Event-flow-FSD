const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All admin routes are protected
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/analytics', getPlatformAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id/suspend', toggleSuspendUser);
router.delete('/users/:id', deleteUser);

// Events
router.get('/events', getAllEvents);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);
router.put('/events/:id/feature', toggleFeatureEvent);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;

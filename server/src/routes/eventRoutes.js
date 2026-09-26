const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadEventImage } = require('../middleware/uploadMiddleware');
const {
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
} = require('../controllers/eventController');

// Public routes
router.get('/', getEvents);
router.get('/categories-public', async (req, res) => {
  const Category = require('../models/Category');
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, categories });
});
router.get('/:idOrSlug', getEvent);

// Organizer routes
router.post('/', protect, authorize('organizer'), uploadEventImage.single('coverImage'), createEvent);
router.put('/my-events', protect, authorize('organizer'), getMyEvents);
router.get('/organizer/my-events', protect, authorize('organizer'), getMyEvents);
router.put('/:id/submit', protect, authorize('organizer'), submitEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), uploadEventImage.single('coverImage'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.get('/:id/attendees', protect, authorize('organizer', 'admin'), getEventAttendees);
router.get('/:id/analytics', protect, authorize('organizer', 'admin'), getEventAnalytics);
router.post('/:id/budget/expenses', protect, authorize('organizer'), addExpense);
router.delete('/:id/budget/expenses/:expenseId', protect, authorize('organizer'), deleteExpense);

module.exports = router;

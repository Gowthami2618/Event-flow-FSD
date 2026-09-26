const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getTicket,
  checkInAttendee,
} = require('../controllers/registrationController');

router.post('/:eventId', protect, authorize('attendee'), registerForEvent);
router.get('/my', protect, authorize('attendee'), getMyRegistrations);
router.get('/:id/ticket', protect, getTicket);
router.put('/:id/cancel', protect, authorize('attendee'), cancelRegistration);
router.put('/checkin', protect, authorize('organizer'), checkInAttendee);

module.exports = router;

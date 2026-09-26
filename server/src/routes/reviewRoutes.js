const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createReview, getEventReviews, respondToReview } = require('../controllers/reviewController');

router.post('/:eventId', protect, authorize('attendee'), createReview);
router.get('/:eventId', getEventReviews);
router.put('/:id/respond', protect, authorize('organizer'), respondToReview);

module.exports = router;

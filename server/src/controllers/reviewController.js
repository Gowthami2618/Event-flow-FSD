const Review = require('../models/Review');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Create review (only attendees who attended)
// @route   POST /api/reviews/:eventId
// @access  Private (Attendee)
const createReview = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Check if user attended
    const registration = await Registration.findOne({
      event: event._id,
      attendee: req.user._id,
      status: { $in: ['confirmed', 'attended'] },
    });

    if (!registration) {
      return res.status(403).json({ success: false, message: 'Only registered attendees can review this event.' });
    }

    const existing = await Review.findOne({ event: event._id, reviewer: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this event.' });
    }

    const review = await Review.create({
      event: event._id,
      reviewer: req.user._id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      isVerifiedAttendee: true,
    });

    // Update event average rating
    const reviews = await Review.find({ event: event._id, isPublished: true });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Event.findByIdAndUpdate(event._id, { averageRating: Math.round(avg * 10) / 10, totalReviews: reviews.length });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for an event
// @route   GET /api/reviews/:eventId
// @access  Public
const getEventReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { event: req.params.eventId, isPublished: true };
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: reviews.length, total, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Organizer respond to a review
// @route   PUT /api/reviews/:id/respond
// @access  Private (Organizer)
const respondToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('event', 'organizer');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    review.response = { text: req.body.text, respondedAt: new Date() };
    await review.save();

    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getEventReviews, respondToReview };

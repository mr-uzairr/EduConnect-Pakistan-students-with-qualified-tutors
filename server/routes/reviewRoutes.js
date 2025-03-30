const express = require("express");
const Review = require("../models/Review");
const Session = require("../models/Session");
const Tutor = require("../models/Tutor");

const router = express.Router();

// Submit a Review (Only after session completion)
router.post("/", async (req, res) => {
    try {
        const { studentId, tutorId, sessionId, rating, reviewText } = req.body;

        // Check if the session is completed
        const session = await Session.findById(sessionId);
        if (!session || session.status !== "completed") {
            return res.status(400).json({ message: "You can only review completed sessions." });
        }

        // Check if the student has already reviewed this session
        const existingReview = await Review.findOne({ studentId, sessionId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this session." });
        }

        // Save review
        const review = new Review({ studentId, tutorId, sessionId, rating, reviewText });
        await review.save();

        // Update Tutor's Average Rating
        const reviews = await Review.find({ tutorId });
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Tutor.findByIdAndUpdate(tutorId, { averageRating });

        res.status(201).json({ message: "Review submitted successfully!", review });
    } catch (error) {
        res.status(500).json({ message: "Error submitting review", error });
    }
});

// Get Reviews for a Tutor
router.get("/:tutorId", async (req, res) => {
    try {
        const reviews = await Review.find({ tutorId: req.params.tutorId }).populate("studentId", "name");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error });
    }
});

module.exports = router;

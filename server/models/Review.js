const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);

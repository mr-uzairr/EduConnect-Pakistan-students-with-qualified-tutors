const mongoose = require("mongoose");

const TutorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qualifications: { type: String, required: true },
    bio: { type: String },
    subjects: { type: [String], required: true },
    price: { type: Number, required: true },
    availability: { type: [String] },
    preferences: { type: String, enum: ["Online", "In-Person", "Both"], required: true },
    profilePicture: { type: String },
});

module.exports = mongoose.model("Tutor", TutorSchema);

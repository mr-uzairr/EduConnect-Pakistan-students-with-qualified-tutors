const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // in hours
  price: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Declined", "Completed"], default: "Pending" },
  paymentStatus: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
});

module.exports = mongoose.model("Session", sessionSchema);

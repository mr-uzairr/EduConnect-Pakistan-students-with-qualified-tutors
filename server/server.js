const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Tutor = require("./models/Tutor");
const Session = require("./models/Session");
const Review = require("./models/Review");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// MongoDB Connection
const MONGO_URI = "mongodb+srv://f219448:12345@cluster0.8vymd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ===================== 🟢 TUTOR ROUTES =====================

// Get all tutors
app.get("/api/tutors", async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get single tutor profile
app.get("/api/tutors/:tutorId/profile", async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.tutorId);
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new tutor
app.post("/api/tutors", async (req, res) => {
  try {
    const { name, subjects, city, price, availability } = req.body;

    if (!name || !subjects || !city || !price || !availability) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newTutor = new Tutor({ 
      name, 
      subjects: Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()),
      city, 
      price, 
      availability: Array.isArray(availability) ? availability : availability.split(',').map(a => a.trim())
    });
    
    await newTutor.save();
    res.status(201).json({ message: "Tutor added successfully!", tutor: newTutor });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update tutor profile with file upload support
app.post("/api/tutors/profile", upload.single("profilePicture"), async (req, res) => {
  try {
    const { tutorId, name, qualifications, bio, subjects, price, availability, preferences } = req.body;

    if (!tutorId) {
      return res.status(400).json({ error: "Tutor ID is required" });
    }

    // Prepare update data
    const updateData = {
      name,
      qualifications,
      bio,
      subjects: Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()),
      price,
      availability: Array.isArray(availability) ? availability : availability.split(',').map(a => a.trim()),
      preferences
    };

    // Handle file upload if present
    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      updateData,
      { new: true }
    );

    if (!updatedTutor) {
      // Clean up uploaded file if tutor not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Tutor not found" });
    }

    res.json({ 
      message: "Profile updated successfully", 
      tutor: updatedTutor 
    });
  } catch (error) {
    console.error("Update error:", error);
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== 🟢 SESSION ROUTES =====================

// Book a session
app.post("/api/book-session", async (req, res) => {
  try {
    const { tutorId, studentName, date, time, type } = req.body;

    if (!tutorId || !studentName || !date || !time || !type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newSession = new Session({ tutorId, studentName, date, time, type });
    await newSession.save();
    res.status(201).json({ message: "Session booked successfully!", session: newSession });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all sessions
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await Session.find().populate("tutorId");
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== 🟢 REVIEW ROUTES =====================

// Submit a review
app.post("/api/reviews", async (req, res) => {
  try {
    const { tutorId, studentName, rating, comment } = req.body;

    if (!tutorId || !studentName || !rating || rating < 1 || rating > 5 || !comment.trim()) {
      return res.status(400).json({ error: "Invalid review data" });
    }

    const completedSession = await Session.findOne({ 
      tutorId, 
      studentName, 
      status: "Completed" 
    });
    
    if (!completedSession) {
      return res.status(400).json({ 
        error: "You can only review tutors after a completed session." 
      });
    }

    const newReview = new Review({ tutorId, studentName, rating, comment });
    await newReview.save();

    // Update tutor rating
    const tutor = await Tutor.findById(tutorId);
    if (tutor) {
      tutor.totalReviews = (tutor.totalReviews || 0) + 1;
      tutor.rating = ((tutor.rating || 0) * (tutor.totalReviews - 1) + rating) / tutor.totalReviews;
      await tutor.save();
    }

    res.status(201).json({ 
      message: "Review submitted successfully", 
      review: newReview 
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get reviews for a tutor
app.get("/api/reviews/:tutorId", async (req, res) => {
  try {
    const reviews = await Review.find({ tutorId: req.params.tutorId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== 🟢 SERVER START =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
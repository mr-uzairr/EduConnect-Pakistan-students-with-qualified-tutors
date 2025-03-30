const express = require("express");
const multer = require("multer");
const path = require("path");
const Tutor = require("../models/Tutor");

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// ✅ POST: Create or update tutor profile
router.post("/profile", upload.single("profilePicture"), async (req, res) => {
    try {
        const { id, name, qualifications, bio, subjects, price, availability, preferences } = req.body;
        const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

        let tutor = await Tutor.findById(id);

        if (tutor) {
            // Update existing tutor profile
            tutor.name = name;
            tutor.qualifications = qualifications;
            tutor.bio = bio;
            tutor.subjects = subjects.split(",");
            tutor.price = price;
            tutor.availability = availability.split(",");
            tutor.preferences = preferences;
            if (profilePicture) tutor.profilePicture = profilePicture;
        } else {
            // Create new tutor profile
            tutor = new Tutor({
                _id: id,
                name,
                qualifications,
                bio,
                subjects: subjects.split(","),
                price,
                availability: availability.split(","),
                preferences,
                profilePicture,
            });
        }

        await tutor.save();
        res.status(201).json({ message: "Tutor profile updated successfully", tutor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch tutor profile by ID
router.get("/profile/:id", async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        if (!tutor) return res.status(404).json({ error: "Tutor not found" });

        res.json(tutor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const path = require("path");
const { Tupath_usersModel } = require("../models/Tupath_users");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/cor/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/api/uploadCOR", upload.fields([{ name: "corDocument" }, { name: "ratingSlip" }]), async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await Tupath_usersModel.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (req.files["corDocument"]) {
      user.profileDetails.corDocuments.push(req.files["corDocument"][0].path);
    }
    if (req.files["ratingSlip"]) {
      user.profileDetails.ratingSlips.push(req.files["ratingSlip"][0].path);
    }

    await user.save();
    res.json({ success: true, message: "Files uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

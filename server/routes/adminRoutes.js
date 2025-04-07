const express = require("express");
const router = express.Router();
const { Tupath_usersModel, Employer_usersModel } = require("../models/Tupath_users");

// Route to toggle user status (active/inactive)
router.put("/toggle-status/:userType/:userId", async (req, res) => {
  try {
    const { userType, userId } = req.params;
    
    // Determine which model to use based on userType
    let userModel;
    if (userType === "student") {
      userModel = Tupath_usersModel;
    } else if (userType === "employer") {
      userModel = Employer_usersModel;
    } else {
      return res.status(400).json({ success: false, message: "Invalid user type" });
    }
    
    // Find the user by ID
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Toggle the status
    user.status = !user.status;
    
    // Save the updated user
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: `User status updated to ${user.status ? "active" : "inactive"}`,
      status: user.status
    });
    
  } catch (error) {
    console.error("Error toggling user status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Export the router
module.exports = router;



const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("../models/Tupath_users");
const router = express.Router();
const JWT_SECRET = "your-secret-key";

const app = express();



router.delete('/api/manage-users/:id', async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // Use the query parameter to identify the user type
  
    try {
      let result;
      if (type === 'Students') {
        result = await Tupath_usersModel.findByIdAndDelete(id);
      } else if (type === 'Employers') {
        result = await Employer_usersModel.findByIdAndDelete(id);
      } else {
        return res.status(400).json({ success: false, message: "Invalid user type" });
      }
  
      if (result) {
        return res.status(200).json({ success: true, message: "User deleted successfully" });
      } else {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
  module.exports = router;
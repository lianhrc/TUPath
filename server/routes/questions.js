

const express = require('express');
const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("../models/Tupath_users");
const router = express.Router();


// Create a new question
router.post('/admin/questions', async (req, res) => {
    try {
      const question = new AssessmentQuestion(req.body);
      const savedQuestion = await question.save();
      res.status(201).json(savedQuestion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Read all questions
  router.get('/admin/questions', async (req, res) => {
    try {
      const questions = await AssessmentQuestion.find();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Read a single question by ID
  router.get('/admin/questions/:id', async (req, res) => {
    try {
      const question = await AssessmentQuestion.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.status(200).json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update a question
  router.put('/admin/questions/:id', async (req, res) => {
    try {
      const updatedQuestion = await AssessmentQuestion.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedQuestion) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete a question
  router.delete('/admin/questions/:id', async (req, res) => {
    try {
      const deletedQuestion = await AssessmentQuestion.findByIdAndDelete(req.params.id);
      if (!deletedQuestion) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;
const express = require('express');
const router = express.Router();
const AdminSubject = require('../models/AdminSubject');

router.get('/', async (req, res) => {
  const data = await AdminSubject.find();
  res.json(data);
});

router.post('/', async (req, res) => {
  const { title, code } = req.body;
  const created = await AdminSubject.create({ title, code });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, code } = req.body;
  const updated = await AdminSubject.findByIdAndUpdate(id, { title, code }, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await AdminSubject.findByIdAndDelete(id);
  res.sendStatus(204);
});

module.exports = router;
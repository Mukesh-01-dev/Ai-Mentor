import express from 'express';
const router = express.Router();
import docData from '../data/docData.js';

// @route   GET /api/docs
// @desc    Get all documentation data
// @access  Public
router.get('/', (req, res) => {
  res.json(docData);
});

export default router;

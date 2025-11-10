const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile } = require('../controllers/studentController');
const auth = require('../middleware/auth');

// @route   GET api/student/me
// @desc    Get current student's profile
// @access  Private (Student)
router.get('/me', auth, getMyProfile);

// @route   PUT api/student/me
// @desc    Create or update student's profile
// @access  Private (Student)
router.put('/me', auth, updateMyProfile);

module.exports = router;

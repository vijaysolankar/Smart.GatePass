const express = require('express');
const router = express.Router();
const {
  recordLog,
  getApprovedPasses,
  getEntryExitLog
} = require('../controllers/securityController');
const auth = require('../middleware/auth');

// @route   POST api/security/logs
// @desc    Record a student's entry or exit
// @access  Private (Security)
router.post('/logs', auth, recordLog);

// @route   GET api/security/approved
// @desc    Get all approved passes for today
// @access  Private (Security)
router.get('/approved', auth, getApprovedPasses);

// @route   GET api/security/logbook
// @desc    Get the full entry/exit log
// @access  Private (Security)
router.get('/logbook', auth, getEntryExitLog);

module.exports = router;

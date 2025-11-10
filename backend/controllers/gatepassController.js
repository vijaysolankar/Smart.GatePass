const Gatepass = require('../models/Gatepass');
const Student = require('../models/Student');
const User = require('../models/User');

// Apply for a new gatepass
exports.applyGatepass = async (req, res) => {
  const {
    studentId, // From verified student
    studentName, // From manual entry
    rollNo,      // From manual entry
    department,  // From manual entry
    outTime,
    inTime,
    reason
  } = req.body;
  const userId = req.user.id;

  try {
    // Generate a unique pass number
    const passNo = `GP${Date.now()}`;

    const newGatepassData = {
      passNo,
      user: userId,
      studentName,
      rollNo,
      department,
      outTime,
      inTime,
      reason,
      status: 'pending',
    };

    // If a verified student ID is provided, link it.
    if (studentId) {
      const student = await Student.findById(studentId);
      if (student) {
        newGatepassData.student = studentId;
      }
    }

    const newGatepass = new Gatepass(newGatepassData);
    const gatepass = await newGatepass.save();
    res.json(gatepass);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Fetch student details by their ID number
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ idNo: req.params.idNo });
    if (!student) {
      return res.status(404).json({ msg: 'Student with this ID not found' });
    }
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update gatepass status (Approve/Reject)
exports.updateGatepassStatus = async (req, res) => {
  let { status } = req.body; // status can be 'approve', 'reject', 'approved', or 'rejected'
  const authorityId = req.user.id;

  // Check if the user is an authority
  if (req.user.role !== 'authority') {
    return res.status(403).json({ msg: 'Access denied. Not an authority.' });
  }

  // Normalize the status to match the schema enum
  if (status === 'approve') status = 'approved';
  if (status === 'reject') status = 'rejected';

  try {
    let gatepass = await Gatepass.findById(req.params.id);
    if (!gatepass) {
      return res.status(404).json({ msg: 'Gatepass not found' });
    }

    gatepass.status = status;
    gatepass.approvedBy = authorityId;
    gatepass.actionDate = Date.now();

    await gatepass.save();
    res.json(gatepass);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get a student's gatepass history
exports.getStudentHistory = async (req, res) => {
  try {
    // Find the user to get their linked student profile
    const user = await User.findById(req.user.id);
    if (!user || !user.studentProfile) {
        return res.status(404).json({ msg: 'Student profile not linked to this user' });
    }

    const gatepasses = await Gatepass.find({ student: user.studentProfile }).sort({ createdAt: -1 });
    res.json(gatepasses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all pending gatepass requests for authority
exports.getPendingRequests = async (req, res) => {
    if (req.user.role !== 'authority') {
        return res.status(403).json({ msg: 'Access denied.' });
    }
    try {
        const pending = await Gatepass.find({ status: 'pending' }).populate('student', ['name', 'department', 'rollNo']).sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all processed gatepass requests for authority
exports.getProcessedRequests = async (req, res) => {
    if (req.user.role !== 'authority') {
        return res.status(403).json({ msg: 'Access denied.' });
    }
    try {
        const processed = await Gatepass.find({ status: { $in: ['approved', 'rejected'] } }).populate('student', ['name', 'department']).sort({ actionDate: -1 });
        res.json(processed);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

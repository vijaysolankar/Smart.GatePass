const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get current student's profile
exports.getMyProfile = async (req, res) => {
    try {
        // The user's ID is available from the auth middleware
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'student') {
            return res.status(403).json({ msg: 'User is not a student' });
        }

        // Find the student profile linked to this user
        const studentProfile = await Student.findById(user.studentProfile);

        if (!studentProfile) {
            return res.status(404).json({ msg: 'Student profile not found for this user' });
        }

        res.json(studentProfile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create or update student's profile
exports.updateMyProfile = async (req, res) => {
    const { name, rollNo, division, address, contact, roomNo, department } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'student') {
            return res.status(403).json({ msg: 'User is not a student' });
        }

        if (!user.studentProfile) {
            return res.status(404).json({ msg: 'No student profile to update. Please contact admin.' });
        }

        const profileFields = {
            name,
            rollNo,
            division,
            address,
            contact,
            roomNo,
            department
        };

        // Find and update the linked student profile
        const studentProfile = await Student.findByIdAndUpdate(
            user.studentProfile,
            { $set: profileFields },
            { new: true, runValidators: true }
        );

        res.json(studentProfile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

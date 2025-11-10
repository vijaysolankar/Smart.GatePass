const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Gatepass = require('./models/Gatepass');
const Log = require('./models/Log');

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Gatepass.deleteMany({});
    await Log.deleteMany({});

    console.log('Data cleared...');

    // --- CREATE STUDENTS ---
    const students = await Student.insertMany([
      {
        idNo: 'FAB-CSE-001',
        name: 'Rahul Sharma',
        rollNo: 'CSE101',
        department: 'Computer Engineering',
        division: 'A',
        contact: '9988776655',
        roomNo: 'A-101',
      },
      {
        idNo: 'FAB-ME-002',
        name: 'Priya Singh',
        rollNo: 'ME205',
        department: 'Mechanical Engineering',
        division: 'B',
        contact: '9876543210',
        roomNo: 'B-202',
      },
    ]);
    console.log('Students seeded...');
    const studentUser1Profile = students[0];

    // --- CREATE USERS ---
    const salt = await bcrypt.genSalt(10);

    const users = await User.insertMany([
      // Student User
      {
        username: 'student',
        email: 'student@fabtech.edu',
        password: await bcrypt.hash('student123', salt),
        role: 'student',
        studentProfile: studentUser1Profile._id, // Link to Rahul Sharma's profile
      },
      // Authority User
      {
        username: 'authority',
        email: 'authority@fabtech.edu',
        password: await bcrypt.hash('authority123', salt),
        role: 'authority',
      },
      // Security User
      {
        username: 'security',
        email: 'security@fabtech.edu',
        password: await bcrypt.hash('security123', salt),
        role: 'security',
      },
    ]);
    console.log('Users seeded...');

    console.log('----------------');
    console.log('SEEDING COMPLETE');
    console.log('----------------');
    console.log('Sample Users:');
    console.log('Student:   username=student,   password=student123');
    console.log('Authority: username=authority, password=authority123');
    console.log('Security:  username=security,  password=security123');
    console.log('----------------');
    console.log('Sample Student IDs for scanning:');
    console.log('- FAB-CSE-001 (Rahul Sharma)');
    console.log('- FAB-ME-002 (Priya Singh)');
    console.log('----------------');


  } catch (err) {
    console.error('Error seeding data:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedData();

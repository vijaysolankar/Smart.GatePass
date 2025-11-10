const Log = require('../models/Log');
const Gatepass = require('../models/Gatepass');

// Record a student's entry or exit
exports.recordLog = async (req, res) => {
  const { gatepassId, type } = req.body; // type will be 'exit' or 'entry'
  const securityId = req.user.id;

  if (req.user.role !== 'security') {
    return res.status(403).json({ msg: 'Access denied. Not a security personnel.' });
  }

  try {
    const gatepass = await Gatepass.findById(gatepassId);
    if (!gatepass || gatepass.status !== 'approved') {
      return res.status(400).json({ msg: 'This gatepass is not approved or does not exist.' });
    }

    let log = await Log.findOne({ gatepass: gatepassId });

    if (type === 'exit') {
      if (log && log.actualOut) {
        return res.status(400).json({ msg: 'Exit already recorded for this pass.' });
      }
      if (!log) {
        log = new Log({ gatepass: gatepassId });
      }
      log.actualOut = Date.now();
      log.outScannedBy = securityId;
    } else if (type === 'entry') {
      if (!log || !log.actualOut) {
        return res.status(400).json({ msg: 'Cannot record entry before exit.' });
      }
      if (log.actualIn) {
        return res.status(400).json({ msg: 'Entry already recorded for this pass.' });
      }
      log.actualIn = Date.now();
      log.inScannedBy = securityId;
    } else {
      return res.status(400).json({ msg: 'Invalid log type specified.' });
    }

    await log.save();
    res.json(log);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all approved passes for today for security
exports.getApprovedPasses = async (req, res) => {
    if (req.user.role !== 'security') {
        return res.status(403).json({ msg: 'Access denied.' });
    }
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const approved = await Gatepass.find({
            status: 'approved',
            outTime: { $gte: today, $lt: tomorrow }
        }).populate('student', ['name', 'department', 'rollNo']);
        
        res.json(approved);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get the full entry/exit log book for security
exports.getEntryExitLog = async (req, res) => {
    if (req.user.role !== 'security') {
        return res.status(403).json({ msg: 'Access denied.' });
    }
    try {
        const logs = await Log.find()
            .populate({
                path: 'gatepass',
                select: 'passNo outTime inTime',
                populate: {
                    path: 'student',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

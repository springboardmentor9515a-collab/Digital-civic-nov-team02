const Petition = require('../models/Petition');
const AdminLog = require('../models/AdminLog');
const Poll = require('../models/Poll');

// @desc    Respond to a petition (Official only)
// @route   POST /api/governance/petitions/:id/respond
exports.respondToPetition = async (req, res) => {
  try {
    const { responseText, newStatus } = req.body;
    const petition = await Petition.findById(req.params.id);

    if (!petition) return res.status(404).json({ message: "Petition not found" });

    petition.officialResponse = responseText;
    petition.respondedBy = req.user.id;
    petition.respondedAt = Date.now();
    petition.status = newStatus || 'closed';

    await petition.save();

    await AdminLog.create({
      action: "Responded to Petition",
      user: req.user.id,
      petition: req.params.id,
      details: `Status changed to ${petition.status}`
    });

    res.status(200).json({ success: true, data: petition });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get Community Analytics (Reports)
// @route   GET /api/governance/reports
exports.getReports = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = location ? { location } : {};

    // 1. Aggregation: Count Petitions by Status
    const petitionStats = await Petition.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2. Aggregation: Count Total Polls
    // Note: If you want to filter polls by targetLocation, ensure Poll model has it.
    const pollCount = await Poll.countDocuments(location ? { targetLocation: location } : {});

    res.status(200).json({
      success: true,
      data: {
        petitionsByStatus: petitionStats,
        totalPolls: pollCount,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Report Error", error: error.message });
  }
};

// @desc    Export Report as CSV
// @route   GET /api/governance/reports/export
exports.exportReports = async (req, res) => {
  try {
    const petitions = await Petition.find().populate('creator', 'name email');

    // Simple CSV Builder (No extra libraries needed)
    let csv = "ID,Title,Category,Status,Signatures,Creator\n";
    
    petitions.forEach(p => {
      csv += `${p._id},"${p.title}","${p.category}",${p.status},${p.signatureCount},"${p.creator?.name || 'Unknown'}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('community_report.csv');
    return res.send(csv);

  } catch (error) {
    res.status(500).json({ message: "Export Error", error: error.message });
  }
};
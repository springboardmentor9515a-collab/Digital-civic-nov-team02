const Petition = require("../models/Petition");
const Signature = require("../models/Signature");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const buildDateRange = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start && !end) return null;

  const range = {};
  if (start) range.$gte = start;
  if (end) {
    const endCopy = new Date(end);
    endCopy.setHours(23, 59, 59, 999);
    range.$lte = endCopy;
  }
  return range;
};

const escapeCSV = (v) => {
  const s = String(v ?? "");
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

exports.getReports = async (req, res) => {
  try {
    // ✅ allow optional override via query, otherwise use official’s location
    const location = (req.query.location && req.query.location.trim()) || req.user?.location;
    if (!location) {
      return res.status(400).json({
        message: "Location missing. Please set location in user profile/token or pass ?location=",
      });
    }

    const { startDate, endDate } = req.query;
    const createdAt = buildDateRange(startDate, endDate);

    // Petitions filter (location + optional createdAt)
    const petitionFilter = { location };
    if (createdAt) petitionFilter.createdAt = createdAt;

    const [total, active, under_review, closed] = await Promise.all([
      Petition.countDocuments(petitionFilter),
      Petition.countDocuments({ ...petitionFilter, status: "active" }),
      Petition.countDocuments({ ...petitionFilter, status: "under_review" }),
      Petition.countDocuments({ ...petitionFilter, status: "closed" }),
    ]);

    // Polls/Votes filter by poll.target_location (schema in your PDF & project)
    const pollFilter = { target_location: location };
    if (createdAt) pollFilter.createdAt = createdAt;
    const totalPolls = await Poll.countDocuments(pollFilter);

    // Votes total for location (join polls → votes)
    const voteAgg = await Vote.aggregate([
      {
        $lookup: {
          from: "polls",
          localField: "poll_id",
          foreignField: "_id",
          as: "poll",
        },
      },
      { $unwind: "$poll" },
      { $match: { "poll.target_location": location } },
      ...(createdAt
        ? [
            {
              $match: {
                $or: [{ createdAt }, { timestamp: createdAt }],
              },
            },
          ]
        : []),
      { $count: "totalVotes" },
    ]);
    const totalVotes = voteAgg?.[0]?.totalVotes || 0;

    // Signatures total for petitions in location (join petitions → signatures)
    const sigAgg = await Signature.aggregate([
      {
        $lookup: {
          from: "petitions",
          localField: "petition",
          foreignField: "_id",
          as: "petitionDoc",
        },
      },
      { $unwind: "$petitionDoc" },
      { $match: { "petitionDoc.location": location } },
      ...(createdAt
        ? [
            {
              $match: {
                $or: [{ createdAt }, { timestamp: createdAt }],
              },
            },
          ]
        : []),
      { $count: "totalSignatures" },
    ]);
    const totalSignatures = sigAgg?.[0]?.totalSignatures || 0;

    // ✅ RESPONSE SHAPE that Reports.jsx expects
    return res.status(200).json({
      success: true,
      data: {
        petitions: { total, active, under_review, closed },
        totals: { totalSignatures, totalVotes, totalPolls },
      },
    });
  } catch (err) {
    console.error("Report error:", err);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
};

exports.exportReportsCSV = async (req, res) => {
  try {
    const location = (req.query.location && req.query.location.trim()) || req.user?.location;
    if (!location) {
      return res.status(400).json({ message: "Location missing for export" });
    }

    const { startDate, endDate } = req.query;
    const createdAt = buildDateRange(startDate, endDate);

    const petitionFilter = { location };
    if (createdAt) petitionFilter.createdAt = createdAt;

    const [total, active, under_review, closed] = await Promise.all([
      Petition.countDocuments(petitionFilter),
      Petition.countDocuments({ ...petitionFilter, status: "active" }),
      Petition.countDocuments({ ...petitionFilter, status: "under_review" }),
      Petition.countDocuments({ ...petitionFilter, status: "closed" }),
    ]);

    const csv = [
      ["Metric", "Value"],
      ["Location", location],
      ["Start Date", startDate || ""],
      ["End Date", endDate || ""],
      ["Total Petitions", total],
      ["Active Petitions", active],
      ["Under Review Petitions", under_review],
      ["Closed Petitions", closed],
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="reports.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error("Export error:", err);
    return res.status(500).json({ message: "Export failed" });
  }
};

const Petition = require("../models/Petition");
const AdminLog = require("../models/AdminLog");

const normalize = (s) => String(s || "").trim();

exports.getPetitionsForOfficial = async (req, res) => {
  try {
    if (!req.user || !req.user.location) {
      return res.status(400).json({
        success: false,
        message: "User location missing in token",
      });
    }

    const { status } = req.query;

    const loc = normalize(req.user.location);

    const filter = {
      location: { $regex: `^${loc}$`, $options: "i" }, // ✅ case-insensitive exact match
    };

    if (status) filter.status = status;

    const petitions = await Petition.find(filter)
      .populate("creator", "name email role location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: petitions.length,
      data: petitions,
    });
  } catch (error) {
    console.error("Error fetching governance petitions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch petitions for official",
    });
  }
};

exports.respondToPetition = async (req, res) => {
  try {
    if (!req.user || !req.user.location) {
      return res.status(400).json({
        success: false,
        message: "User location missing in token",
      });
    }

    const { id } = req.params;
    const { comment, status } = req.body;

    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({ success: false, message: "Petition not found" });
    }

    const loc = normalize(req.user.location);

    // ✅ Location-level authorization (case-insensitive)
    if (normalize(petition.location).toLowerCase() !== loc.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to respond to this petition",
      });
    }

    // ✅ Validate status (Milestone-4 wants under_review / closed)
    const allowedStatus = ["under_review", "closed"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be under_review or closed",
      });
    }

    const responseText = String(comment || "").trim();
    if (!responseText) {
      return res.status(400).json({
        success: false,
        message: "Response comment is required",
      });
    }

    // ✅ Save response (structured + checklist aliases)
    petition.officialResponse = {
      comment: responseText,
      respondedBy: req.user.id, // ✅ FIX
      respondedAt: new Date(),
    };
    petition.officialResponseText = responseText;
    petition.respondedBy = req.user.id;
    petition.respondedAt = petition.officialResponse.respondedAt;

    petition.status = status || petition.status;

    await petition.save();

    await AdminLog.create({
      action: `Official responded to petition (status: ${petition.status})`,
      user: req.user.id,
      petition: petition._id,
    });

    return res.status(200).json({
      success: true,
      message: "Petition responded successfully",
      data: petition,
    });
  } catch (error) {
    console.error("Error responding to petition:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to petition",
    });
  }
};

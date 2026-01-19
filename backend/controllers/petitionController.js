const Petition = require('../models/Petition');
const Signature = require('../models/Signature');

/* ---------------- CREATE PETITION ---------------- */
exports.createPetition = async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Only citizens can create petitions.' });
    }

    const { title, description, category, location, goal } = req.body;
    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const petition = await Petition.create({
      title,
      description,
      category,
      location,
      goal: goal || 100,
      creator: req.user.id,
      status: 'active'
    });

    res.status(201).json(petition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET ALL PETITIONS ---------------- */
exports.getAllPetitions = async (req, res) => {
  try {
    const { category, location, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (location) query.location = location;
    if (status) query.status = status;

    const petitions = await Petition.find(query)
      .populate('creator', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Petition.countDocuments(query);

    res.json({
      petitions,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET PETITION BY ID ---------------- */
exports.getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id)
      .populate('creator', 'name');

    if (!petition) {
      return res.status(404).json({ message: 'Petition not found' });
    }

    res.json(petition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- SIGN PETITION ---------------- */
exports.signPetition = async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Only citizens can sign petitions.' });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: 'Petition not found' });
    }

    // Prevent duplicate signing
    const existingSignature = await Signature.findOne({
      petition: petition._id,
      user: req.user.id
    });

    if (existingSignature) {
      return res.status(400).json({ message: 'You have already signed this petition' });
    }

    await Signature.create({
      petition: petition._id,
      user: req.user.id
    });

    petition.signatureCount += 1;
    await petition.save();

    res.json({ message: 'Petition signed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- UPDATE PETITION STATUS (OFFICIAL) ---------------- */
exports.updatePetitionStatus = async (req, res) => {
  try {
    if (req.user.role !== 'official') {
      return res.status(403).json({ message: 'Officials only' });
    }

    const { status } = req.body;
    if (!['under_review', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const petition = await Petition.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!petition) {
      return res.status(404).json({ message: 'Petition not found' });
    }

    res.json(petition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

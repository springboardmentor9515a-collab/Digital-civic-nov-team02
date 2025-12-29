const Petition = require('../models/Petition');

// --- 2.1 CREATE PETITION ---
exports.createPetition = async (req, res) => {
  try {
    // 1. Check Role: Only 'citizen' can create petitions
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Access denied. Only citizens can create petitions.' });
    }

    // 2. Validate Input (Basic validation)
    const { title, description, category, location, goal } = req.body;
    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 3. Create and Save
    const newPetition = new Petition({
      title,
      description,
      category,
      location,
      goal: goal || 100,
      creator: req.user.id, // Attach the logged-in user's ID
      status: 'active' // Default status
    });

    const savedPetition = await newPetition.save();
    res.status(201).json(savedPetition);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- 2.2 GET ALL PETITIONS ---
exports.getAllPetitions = async (req, res) => {
  try {
    // 1. Filtering Logic (Support query params: location, category, status)
    const { category, location, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (location) query.location = location;
    // If no status is requested, return 'active' ones by default (optional, but good for UX)
    if (status) query.status = status; 

    // 2. Pagination Logic
    const petitions = await Petition.find(query)
      .populate('creator', 'name') // Show the creator's name, not just ID
      .limit(limit * 1) // Convert string to number
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 }); // Newest first

    // Get total count for pagination
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
const express = require('express');
const router = express.Router();
const Craftsman = require('../models/Craftsman');

// Get all craftsmen with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', specialty = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Specialty filter
    if (specialty) {
      query.specialty = specialty;
    }
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const craftsmen = await Craftsman.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Craftsman.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      craftsmen,
      totalPages,
      currentPage: parseInt(page),
      totalCount: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single craftsman
router.get('/:id', async (req, res) => {
  try {
    const craftsman = await Craftsman.findById(req.params.id);
    if (!craftsman) {
      return res.status(404).json({ message: 'Craftsman not found' });
    }
    res.json(craftsman);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new craftsman
router.post('/', async (req, res) => {
  try {
    const craftsman = new Craftsman(req.body);
    const newCraftsman = await craftsman.save();
    res.status(201).json(newCraftsman);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update craftsman
router.put('/:id', async (req, res) => {
  try {
    const craftsman = await Craftsman.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!craftsman) {
      return res.status(404).json({ message: 'Craftsman not found' });
    }
    res.json(craftsman);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete craftsman
router.delete('/:id', async (req, res) => {
  try {
    const craftsman = await Craftsman.findByIdAndDelete(req.params.id);
    if (!craftsman) {
      return res.status(404).json({ message: 'Craftsman not found' });
    }
    res.json({ message: 'Craftsman deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
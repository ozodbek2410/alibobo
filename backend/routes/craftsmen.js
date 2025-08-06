const express = require('express');
const router = express.Router();
const Craftsman = require('../models/Craftsman');

// GET all craftsmen
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', specialty = '', sortBy = 'joinDate', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (specialty && specialty !== 'Barcha mutaxassisliklar') {
      query.specialty = specialty;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const craftsmen = await Craftsman.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Craftsman.countDocuments(query);
    
    res.json({
      craftsmen,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single craftsman
router.get('/:id', async (req, res) => {
  try {
    const craftsman = await Craftsman.findById(req.params.id);
    if (!craftsman) {
      return res.status(404).json({ message: 'Usta topilmadi' });
    }
    res.json(craftsman);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new craftsman
router.post('/', async (req, res) => {
  try {
    const craftsman = new Craftsman(req.body);
    if (req.body.portfolio !== undefined) {
      craftsman.portfolio = req.body.portfolio;
    }
    const newCraftsman = await craftsman.save();
    res.status(201).json(newCraftsman);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update craftsman
router.put('/:id', async (req, res) => {
  try {
    console.log('🔄 PUT request received for ID:', req.params.id);
    console.log('📥 Request body portfolio length:', req.body.portfolio ? req.body.portfolio.length : 'undefined');
    
    // Use findByIdAndUpdate to ensure portfolio is properly updated
    const updatedCraftsman = await Craftsman.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        phone: req.body.phone,
        specialty: req.body.specialty,
        price: req.body.price,
        status: req.body.status,
        description: req.body.description,
        portfolio: req.body.portfolio || []
      },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    );
    
    if (!updatedCraftsman) {
      console.log('❌ Craftsman not found');
      return res.status(404).json({ message: 'Usta topilmadi' });
    }
    
    console.log('📤 Updated craftsman portfolio length:', updatedCraftsman.portfolio.length);
    console.log('✅ Successfully updated craftsman');
    res.json(updatedCraftsman);
  } catch (error) {
    console.error('❌ Error updating craftsman:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE craftsman
router.delete('/:id', async (req, res) => {
  try {
    const craftsman = await Craftsman.findByIdAndDelete(req.params.id);
    
    if (!craftsman) {
      return res.status(404).json({ message: 'Usta topilmadi' });
    }
    
    res.json({ message: 'Usta muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET craftsmen count
router.get('/count/total', async (req, res) => {
  try {
    const count = await Craftsman.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
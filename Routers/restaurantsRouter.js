import Restaurant from "../Models/restaurant.js";
import express from 'express';

const router = express.Router();

router.get('/all', async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const restaurants = await Restaurant.find().skip(offset).limit(limit).select('-createdAt');
    res.status(200).json({ restaurants });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/findRestsByName/', async (req, res) => {
  try {
    const name = req.query.name;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const restaurants = await Restaurant.find({ name: { $regex: name, $options: 'i' } }).skip(offset).limit(limit).select('-createdAt');
    if (!restaurants) {
      return res.status(401).json({ message: 'Restaurant name not found' });
    }

    return res.status(200).json({ restaurants: restaurants });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

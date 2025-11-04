import express from "express";
import { authMiddleware } from '../Middleware/userAccountAuthMiddleware.js';
import Tag from "../Models/tag.js";
import mongoose from "mongoose";

const router = express.Router();

router.get('/findByName/:name', async (req, res) => {
  try {
    const tagName = req.params.name;
    const tag = await Tag.findOne({ name: tagName }).select('_id name');
    if (!tag) {
      return res.status(401).json({ message: 'Tag name not found' });
    }

    return res.status(200).json({ tag: tag });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/findTagsByName/', async (req, res) => {
  try {
    const name = req.query.name;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const tags = await Tag.find({ name: { $regex: name, $options: 'i' } }).sort({ usageCount: -1 }).skip(offset).limit(limit).select('_id name').select('-createdAt');
    if (!tags) {
      return res.status(401).json({ message: 'Tag name not found' });
    }

    return res.status(200).json({ tags: tags });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/findById/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const tag = await Tag.findById(id).select('_id name');
    if (!tag) {
      return res.status(401).json({ message: 'Tag name not found' });
    }

    return res.status(200).json({ tag: tag });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const tags = await Tag.find().sort({ usageCount: -1 }).skip(offset).limit(limit).select('-createdAt').select('_id name');
    if (!tags) {
      return res.status(401).json({ message: 'No tags found' });
    }
    res.status(200).json({ tags: tags });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

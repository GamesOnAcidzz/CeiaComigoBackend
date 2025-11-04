import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserRest from '../Models/userRest.js';
import Restaurant from '../Models/restaurant.js';
import { authMiddleware } from '../Middleware/userRestAuthMiddleware.js';
import Tag from '../Models/tag.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userRest = await UserRest.findOne({ email });
  if (!userRest)
    return res.status(401).json({ message: 'User does not exist' });
  else if (!(await bcrypt.compare(password, userRest.password)))
    return res.status(402).json({ message: 'Invalid password' });
  else {
    const token = jwt.sign({ userRestId: userRest._id }, process.env.JWT_SECRET);
    res.status(200).json({ token: token, id: userRest._id, email: userRest.email });
  }
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const userRest = new UserRest({ email, password });
  await userRest.save();
  res.status(201).json({ message: 'UserRest created' });
});

router.post('/restaurant/add', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const userRestId = req.userRestId;
  if (!name) {
    return res.status(401).json({ error: 'Missing name' });
  }
  try {
    const newRestaurant = new Restaurant({ name });
    const savedRestaurant = await newRestaurant.save();

    const updatedUser = await UserRest.findByIdAndUpdate(
      userRestId, { $push: { restIds: savedRestaurant._id } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(403).json({ error: 'UserRest not found' });
    }

    res.status(201).json({
      message: 'Restaurant created and added to user',
      restaurant: savedRestaurant,
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/restaurant/all', authMiddleware, async (req, res) => {
  try {
    const userRestId = req.userRestId;
    const userRest = await UserRest.findById(userRestId);
    if (userRest.restIds.length == 0) {
      return res.status(401).json({ error: "UserRest has no restaurants" });
    }

    const restaurants = await Restaurant.find({ _id: { $in: userRest.restIds } });
    res.status(200).json({ restaurants });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.put('/restaurant/update', authMiddleware, async (req, res) => {
  try {
    const userRestId = req.userRestId;
    const { restaurantId, name } = req.body;
    if (!name) {
      return res.status(401).json({ error: 'No new info updated' });
    }

    const user = await UserRest.findById(userRestId);
    if (!user || !user.restIds.includes(restaurantId)) {
      return res.status(402).json({ error: 'Restaurant id not found on userRest' });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId, { name }, { new: true });

    if (!updatedRestaurant) {
      return res.status(403).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({ message: 'Restaurant updated', restaurant: updatedRestaurant });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/tag/add', authMiddleware, async (req, res) => {
  try {
    const userRestId = req.userRestId;
    let { name } = req.body;
    if (!name) {
      return res.status(401).json({ message: 'No name provided for tag' });
    }

    name = name.toLowerCase();

    const existingTag = await Tag.findOne({ name: name });
    if (existingTag) {
      return res.status(402).json({ message: 'Tag already exists' });
    }

    const tag = new Tag({ name: name, createdBy: userRestId });
    await tag.save();

    const populatedTag = await Tag.findById(tag._id).populate('createdBy', '_id email');

    return res.status(200).json({ tag: populatedTag });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/tag/remove', authMiddleware, async (req, res) => {
  try {
    const userRestId = req.userRestId;
    let { name } = req.body;
    if (!name) {
      return res.status(401).json({ message: 'No name provided for tag' });
    }
    name = name.toLowerCase();
    const tag = await Tag.findOne({ name: name });
    if (!tag) {
      return res.status(402).json({ message: 'Tag doesnt exist' });
    }
    if (tag.createdBy != userRestId) {
      return res.status(403).json({ message: 'You are not the creator of this tag' });
    }

    await Tag.deleteOne({ _id: tag._id });

    return res.status(200).json({ message: 'Tag deleted' });
  }
  catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }

});

export default router;

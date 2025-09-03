import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserClient from '../Models/userClientModel.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userClient = await UserClient.findOne({ email });
  if (!userClient || !(await bcrypt.compare(password, userClient.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userClientId: userClient._id }, process.env.JWT_SECRET);
  res.json({ token: token, name: userClient.name, email: userClient.email });
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const userClient = new UserClient({ name, email, password });
  await userClient.save();
  res.status(201).json({ message: 'UserClient created' });
});

export default router;

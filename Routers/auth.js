import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserAccount from '../Models/userAccount.js';
import UserProfile from '../Models/userProfile.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userAccount = await UserAccount.findOne({ email: email });
  const userAccountPopulated = await UserAccount.findById(userAccount._id)
    .select('-password')
    .populate({
      path: 'userProfileId', populate: [
        { path: 'tags', select: '_id name' },
        { path: 'favouriteRests', select: '_id name' }]
    });

  if (!userAccount)
    return res.status().json({ message: 'User does not exist' });
  else if (!(await bcrypt.compare(password, userAccount.password)))
    return res.status(402).json({ message: 'Invalid password' });
  else {
    const token = jwt.sign({ userAccountId: userAccount._id }, process.env.JWT_SECRET);

    res.status(200).json({ token: token, userAccount: userAccountPopulated });
  }
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const userProfile = new UserProfile({ name: name });
  const userAccount = new UserAccount({ email: email, password: password, userProfileId: userProfile._id });
  await userProfile.save();
  await userAccount.save();
  res.status(201).json({ message: 'UserAccount created' });
});

router.post('/auth', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userAccount = await UserAccount.findById(decoded.userAccountId)
      .select('-password')
      .populate({
        path: 'userProfileId', populate: [
          { path: 'tags', select: '_id name' },
          { path: 'favouriteRests', select: '_id name' }]
      });

    if (!userAccount) {
      return res.status(401).json({ message: 'Invalid token: userAccount not found' });
    }

    res.status(200).json({
      userAccount: userAccount,
      token: token,
    });
  } catch (err) {
    res.status(403).json({ error: 'Token verification failed' });
  }

});

export default router;

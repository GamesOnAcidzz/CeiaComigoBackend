import express from "express";
import UserProfile from "../Models/userProfile.js";
import { authMiddleware } from "../Middleware/userAccountAuthMiddleware.js";
import UserAccount from "../Models/userAccount.js";
import Tag from "../Models/tag.js";
import Restaurant from "../Models/restaurant.js";

const router = express.Router();

router.get('/userDetails', authMiddleware, async (req, res) => {
  const userAccountId = req.userAccountId;

  if (!userAccountId) {
    return res.status(401).json({ message: 'No token found' });
  }
  const userAccount = await UserAccount.findById(userAccountId);
  if (!userAccount) {
    return res.status(402).json({ message: 'No account found' });
  }
  try {
    const userProfile = await UserProfile.findById(userAccount.userProfileId).populate('tags', '_id name').populate('favouriteRests', '_id name');
    if (!userProfile) {
      return res.status(403).json({ message: 'Failed to update bio' });
    }
    return res.status(200).json({
      userProfile: userProfile
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all', async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const userProfiles = await UserProfile.find().skip(offset).limit(limit).select('-createdAt');
    return res.status(200).json({ userProfiles });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const userProfile = await UserProfile.findById(id).populate('tags', 'name').populate('favouriteRests', '_id name');
  if (!userProfile) {
    return res.status(401).json({ message: 'UserProfile not found' });
  }
  return res.status(200).json({ userProfile: userProfile });
});

router.put('/bio', authMiddleware, async (req, res) => {
  try {
    const { bio } = req.body;
    if (!bio || bio == '') {
      return res.status(401).json({ message: 'No bio provided' });
    }
    const userAccountId = req.userAccountId;
    const userAccount = await UserAccount.findById(userAccountId);
    const userProfile = await UserProfile.findByIdAndUpdate(userAccount.userProfileId, { bio: bio }, { new: true });
    return res.status(200).json({ userProfile: userProfile });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error ', err });
  }
});

router.put('/favouriteRest', authMiddleware, async (req, res) => {
  try {
    const { restId } = req.body;
    const userAccountId = req.userAccountId;
    const userAccount = await UserAccount.findById(userAccountId);
    const userProfile = await UserProfile.findById(userAccount.userProfileId);
    const foundRestaurant = userProfile.favouriteRests.includes(restId);
    const restaurant = await Restaurant.findById(restId);
    if (!restId) {
      return res.status(400).json({ message: 'No rest ID provided' });
    }

    if (!foundRestaurant) {
      userProfile.favouriteRests.push(restId);
    }
    if (foundRestaurant) {
      userProfile.favouriteRests.pull(restId);
    }

    await userProfile.save();

    return res.status(200).json({ isAdded: !foundRestaurant, restaurant: restaurant });
  } catch (err) {
    return res.status(500).json({ error: 'Server error ', err });
  }

});

router.put('/tags', authMiddleware, async (req, res) => {
  try {
    const { tagIds } = req.body;
    const userAccountId = req.userAccountId;

    // Validate tagIds
    if (!Array.isArray(tagIds) || tagIds.length === 0 || tagIds.some(id => typeof id !== 'string')) {
      return res.status(400).json({ message: 'Invalid or missing tag IDs' });
    }

    // Fetch user account
    const userAccount = await UserAccount.findById(userAccountId);
    if (!userAccount) {
      return res.status(401).json({ message: 'User account not found' });
    }

    // Fetch user profile
    const userProfile = await UserProfile.findById(userAccount.userProfileId);
    if (!userProfile) {
      return res.status(402).json({ message: 'User profile not found' });
    }

    // Merge and deduplicate tags
    const existingTags = userProfile.tags.map(tag => tag.toString());
    const uniqueTags = [...new Set([...existingTags, ...tagIds])];

    // Update usage count for each tag
    await Promise.all(
      uniqueTags.map(_id =>
        Tag.findByIdAndUpdate(_id, { $inc: { usageCount: 1 } }, { new: true })
      )
    );

    // Save updated tags to profile
    userProfile.tags = uniqueTags;
    await userProfile.save();

    // Populate tags for response
    const populatedProfile = await UserProfile.findById(userProfile._id).populate('tags', '_id name');

    return res.status(200).json({ userProfile: populatedProfile });
  } catch (err) {
    console.error('Error updating tags:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

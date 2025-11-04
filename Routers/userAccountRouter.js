import express from "express";
import { authMiddleware } from '../Middleware/userAccountAuthMiddleware.js';
import jwt from 'jsonwebtoken';
import Group from "../Models/group.js";
import Restaurant from "../Models/restaurant.js";
import mongoose from "mongoose";
import UserAccount from "../Models/userAccount.js";

const router = express.Router();

router.post('/group/create', authMiddleware, async (req, res) => {
  const { name, description, isPrivate, capacity, restaurantId, scheduledDate, scheduledTime } = req.body;
  const userAccount = await UserAccount.findById(req.userAccountId);
  const hostId = userAccount.userProfileId;
  console.log("HostID : ", hostId);
  if (!name)
    return res.status(401).json({ message: "No name provided" });
  if (!description)
    return res.status(402).json({ message: "No description provided" });
  if (!restaurantId)
    return res.status(403).json({ message: "No restaurandId provided" });
  if (!hostId)
    return res.status(405).json({ message: "No hostId provided" });
  if (!scheduledDate)
    return res.status(406).json({ message: "No scheduledDate provided" });
  if (!scheduledTime)
    return res.status(407).json({ message: "No scheduledTime provided" });
  try {
    const newGroup = new Group({
      name: name,
      description: description,
      isPrivate: isPrivate,
      capacity: capacity,
      hostId: new mongoose.Types.ObjectId(hostId),
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      userProfileIds: [new mongoose.Types.ObjectId(hostId)]
    });
    const restaurant = await Restaurant.findById(restaurantId);


    if (!restaurant) {
      return res.status(408).json({ message: "Restaurant id not found" });
    }

    if (isPrivate) {
      restaurant.privateGroupIds.push(newGroup._id);
    }
    else {
      restaurant.publicGroupIds.push(newGroup._id);

    }

    const token = jwt.sign({ groupId: newGroup._id }, process.env.JWT_GROUP_SECRET);
    newGroup.secret = token;
    await newGroup.save();
    await restaurant.save();
    const populatedGroup = await Group.findById(newGroup._id)
      .populate('hostId', '-tags -favouriteRests')
      .populate('userProfileIds', '-tags -favouriteRests')
      .populate('tags', '_id name usageCount');
    return res.status(200).json({ message: "Group created", group: populatedGroup });
  } catch (err) {
    console.error('Error creating group', err);
    return res.status(500).json({ error: "Server error ", err });
  }
});

router.get('/group/manage', authMiddleware, async (req, res) => {
  const userAccountId = req.userAccountId;
  const userAccount = await UserAccount.findById(userAccountId);
  const groups = await Group.find({ userProfileIds: { $in: [userAccount.userProfileId] } }).populate('hostId').populate('userProfileIds');
  const restaurantIds = groups.map(group => group.restaurantId).filter(id => id);
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } });
  try {
    if (!groups) {
      return res.status(401).json({ message: "No groups found" });
    }
    return res.status(200).json({ groups: groups, restaurants: restaurants, });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get('/group/details', authMiddleware, async (req, res) => {
  const groupId = req.headers['groupid'];
  const group = await Group.findById(groupId)
    .populate('hostId', '-tags -favouriteRests')
    .populate('tags', '_id name')
    .populate('userProfileIds', '-tags -favouriteRests');
  try {
    if (!group) {
      return res.status(401).json({ message: "No group found" });
    }
    return res.status(200).json({ group: group });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }

});

router.post('/group/join', authMiddleware, async (req, res) => {
  const { secret } = req.body;
  const userAccountId = req.userAccountId;
  if (!secret)
    return res.status(400).json({ message: "No secret provided" });
  try {
    const decoded = jwt.verify(secret, process.env.JWT_GROUP_SECRET);
    const groupId = decoded.groupId;

    if (!groupId)
      return res.status(401).json({ message: "Invalid token" });

    const group = await Group.findById(groupId);

    if (!group)
      return res.status(402).json({ message: "Group not found" });

    if (group.userAccountIds.includes(userAccountId))
      return res.status(403).json({ message: "User already in the group" });

    if (!group.isPrivate && group.capacity && group.userAccountIds.length >= group.capacity)
      return res.status(404).json({ message: "Group is full" });

    group.userAccountIds.push(userAccountId);
    await group.save();

    return res.status(200).json({ message: "Joined group successfully", group: group });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post('/group/cancel', authMiddleware, async (req, res) => {
  const { groupId } = req.body;
  const userAccountId = req.userAccountId;

  if (!groupId)
    return res.status(400).json({ message: 'No groupId provided' });

  try {
    const group = await Group.findById(groupId);

    if (!group)
      return res.status(401).json({ message: 'Group not found' });
    if (group.hostId != userAccountId)
      return res.status(402).json({ message: 'Only the host can cancel' });

    group.status = 5;

    await group.save();

    return res.status(200).json({ message: "Group cancelled" });
  } catch (err) {
    return res.status(500).json({ error: 'Server Error' });
  }
});

router.delete('/group/delete', authMiddleware, async (req, res) => {
  const { groupId } = req.body;
  const userAccountId = req.userAccountId;

  if (!groupId)
    return res.status(400).json({ message: 'No groupId provided' });

  try {
    const group = await Group.findById(groupId);

    if (!group)
      return res.status(401).json({ message: 'Group not found' });
    if (group.hostId != userAccountId)
      return res.status(402).json({ message: 'Only the host can cancel' });

    await Group.findByIdAndDelete(groupId);

    return res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    return res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/group/public', authMiddleware, async (req, res) => {
  const { restaurantId } = req.query;
  if (!restaurantId)
    return res.status(400).json({ message: "No RestaurantId provided" });
  try {
    const restaurant = await Restaurant.findById(restaurantId)
      .populate({
        path: 'publicGroupIds',
        populate: [
          {
            path: 'hostId',
            select: '-tags -favouriteRests'
          },
          {
            path: 'userProfileIds',
            select: '-tags -favouriteRests'
          },
          {
            path: 'tags',
            select: '_id name usageCount'
          }
        ]
      });


    return res.status(200).json({ groups: restaurant.publicGroupIds });
  } catch (err) {
    return res.status(500).json({ err: "Server error ", err });
  }
});

export default router;

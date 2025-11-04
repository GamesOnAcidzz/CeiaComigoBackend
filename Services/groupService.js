import mongoose from 'mongoose';
import Group from '../Models/group.js';
import { group } from 'console';

export function handleGroupEvents(io, socket) {
  socket.on('joinGroupPublic', async ({ groupId, userProfileId }) => {
    console.log('User Profiled Id: ', userProfileId);

    socket.join(groupId);
    await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { userProfileIds: new mongoose.Types.ObjectId(userProfileId) } }
    );

    const updatedGroup = await Group.findById(groupId)
      .populate('hostId', '-tags -favouriteRests')
      .populate('tags', '_id name')
      .populate('userProfileIds', '-tags -favouriteRests');
    if (!updatedGroup) {
      socket.emit('error', 'Group not found');
      return;
    }
    io.to(groupId).emit('userJoined', { group: updatedGroup });

  });

  socket.on('createGroup', async ({ groupId }) => {
    socket.join(groupId);
  });

  socket.on('joinGroupPrivate', async ({ groupId, userProfileId, secret }) => {
    try {
      const group = await Group.findByIdAndUpdate(groupId, { $addToSet: { userProfileIds: new mongoose.Types.ObjectId(userProfileId) } }, { new: true }).populate('userProfileIds').populate('restaurantId').populate('hostId');
      if (!group) {
        socket.emit('error', 'Group not found');
        return;
      }
      if (group.secret != secret) {
        socket.emit('error', 'Secret not a match');
        return; 5
      }

      socket.join(groupId);
      io.to(groupId).emit('userJoined', { group: group });
    } catch (error) {
      console.error('Error in JoinGroupPrivate', error);
      socket.emit('error', 'Internal server error');
    }

  });

  socket.on('leaveGroup', async ({ groupId, userProfileId }) => {
    const group = await Group.findByIdAndUpdate(groupId, { $pull: { userProfileIds: userProfileId } }, { new: true }).populate('userProfileIds').populate('restaurantId').populate('hostId');
    io.to(groupId).emit('userLeft', { group: group });
    socket.leave(groupId);
  });

  socket.on('kickGroup', async ({ groupId, userProfileId }) => {
    const group = await Group.findByIdAndUpdate(groupId, { $pull: { userProfileIds: userProfileId } }, { new: true }).populate('userProfileIds').populate('restaurantId').populate('hostId');
    io.to(groupId).emit('userKicked', { group: group, userProfileId: userProfileId });
  });

  socket.on('kickedFromGroup', async ({ groupId }) => {
    socket.leave(groupId);
  });
}

import { Server } from 'socket.io';
import { handleGroupEvents } from './Services/groupService.js';

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    }
  });
  io.on('connection', (socket) => {
    console.log('Socket connected: ', socket.id);

    handleGroupEvents(io, socket);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

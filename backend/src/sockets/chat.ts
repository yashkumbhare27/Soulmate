import { Server, Socket } from 'socket.io';
import { ChatMessageModel } from '../models/ChatMessage';
import { UserModel } from '../models/User';
import { MatchModel } from '../models/Match';

export const initSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected to socket:', socket.id);

    // Join match room
    socket.on('join_room', (data: { matchId: string }) => {
      const { matchId } = data;
      socket.join(matchId);
      console.log(`Socket ${socket.id} joined match room: ${matchId}`);
    });

    // Send Message
    socket.on('send_message', async (data: { matchId: string; senderId: string; text: string }) => {
      const { matchId, senderId, text } = data;

      try {
        // Save message to database
        const message = new ChatMessageModel({
          matchId,
          senderId,
          text,
          timestamp: new Date()
        });
        await message.save();

        // Broadcast message to everyone in the room
        io.to(matchId).emit('receive_message', {
          id: message._id.toString(),
          matchId,
          senderId,
          text,
          timestamp: message.timestamp.toISOString()
        });

        // Simulating other user's response if it is a mock profile
        const match = await MatchModel.findById(matchId);
        if (match) {
          const otherUserId = match.users.find(id => id.toString() !== senderId)?.toString();
          if (otherUserId) {
            const otherUser = await UserModel.findById(otherUserId);
            
            if (otherUser && (otherUser.email.includes('mock') || otherUser.email.includes('test') || otherUser.name.includes('Simulated'))) {
              // Trigger a simulated reply after a brief delay
              setTimeout(async () => {
                const replies = [
                  "That sounds lovely! I really like how our profiles connect.",
                  "I agree. Tell me more about what you value in relationships?",
                  "That's interesting. I love travelling too, especially trekking in the Western Ghats!",
                  "Shall we plan a call or coffee meet? Let's check with our family involvement mode too.",
                  "I am happy we matched! The SoulMate AI explanation of our compatibility was spot on."
                ];
                const randomReply = replies[Math.floor(Math.random() * replies.length)];

                const mockMessage = new ChatMessageModel({
                  matchId,
                  senderId: otherUserId,
                  text: randomReply,
                  timestamp: new Date()
                });
                await mockMessage.save();

                io.to(matchId).emit('receive_message', {
                  id: mockMessage._id.toString(),
                  matchId,
                  senderId: otherUserId,
                  text: randomReply,
                  timestamp: mockMessage.timestamp.toISOString()
                });
              }, 2000);
            }
          }
        }
      } catch (error) {
        console.error('Error handling socket message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from socket:', socket.id);
    });
  });
};

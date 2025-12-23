const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

// Track user socket connections
const userSockets = new Map(); // userId -> socketId

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "https://dev-connect-fe.vercel.app",
    },
  });

  io.on("connection", (socket) => {
    // Register user connection
    socket.on("registerUser", ({ userId }) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      
      // Register user if not already registered
      if (!userSockets.has(userId)) {
        userSockets.set(userId, socket.id);
      }
    });

    socket.on(
      "sendMessage",
      async ({ userId, firstName, targetUserId, text, photoUrl }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          
          // Save messages to DB
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
              unreadCount: new Map(),
            });
          }
          chat.messages.push({
            senderId: userId,
            text,
          });
          
          // Increment unread count for target user
          const currentUnread = chat.unreadCount.get(targetUserId.toString()) || 0;
          chat.unreadCount.set(targetUserId.toString(), currentUnread + 1);
          
          await chat.save();

          // Emit message to chat room
          io.to(roomId).emit("messageRecieved", {
            firstName,
            text,
            photoUrl,
          });

          // Send notification to target user if they're online but not in the chat room
          const targetSocketId = userSockets.get(targetUserId);
          if (targetSocketId) {
            // Check if target user is in the chat room
            const targetSocket = io.sockets.sockets.get(targetSocketId);
            const isInChatRoom = targetSocket?.rooms.has(roomId);
            
            // Only send notification if user is not currently in the chat
            if (!isInChatRoom) {
              io.to(targetSocketId).emit("messageNotification", {
                senderId: userId,
                senderName: firstName,
                text,
              });
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    );

    socket.on("disconnect", () => {
      // Remove user from tracking
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};

module.exports = initializeSocket;

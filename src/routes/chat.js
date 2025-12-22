const express = require("express");
const Chat = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async(req, res) => {
    const targetUserId = req.params.targetUserId;
    const userId = req.user._id;

    try{
        let chat = await Chat.findOne({
            participants : { $all : [userId, targetUserId]}
        }).populate({
            path : "messages.senderId",
            select : "firstName lastName photoUrl"
        })
        if(!chat){
            chat = new Chat({
                participants : [userId, targetUserId],
                messages : [],
                unreadCount : new Map()
            })
            await chat.save();
        } else {
            // Clear unread count for current user when they open the chat
            chat.unreadCount.set(userId.toString(), 0);
            await chat.save();
        }
        res.json(chat)
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }

})

// Get all unread message counts for the current user
chatRouter.get("/chat/unread/all", userAuth, async(req, res) => {
    const userId = req.user._id;

    try{
        // Find all chats where user is a participant
        const chats = await Chat.find({
            participants : userId
        });

        // Build unread counts object: { otherUserId: unreadCount }
        const unreadCounts = {};
        chats.forEach(chat => {
            const unreadCount = chat.unreadCount.get(userId.toString()) || 0;
            if (unreadCount > 0) {
                // Find the other participant
                const otherParticipant = chat.participants.find(
                    p => p.toString() !== userId.toString()
                );
                if (otherParticipant) {
                    unreadCounts[otherParticipant.toString()] = unreadCount;
                }
            }
        });

        res.json({ unreadCounts });
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to fetch unread counts" });
    }
})

module.exports = chatRouter;
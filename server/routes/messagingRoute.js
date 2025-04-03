const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { Tupath_usersModel, Employer_usersModel } = require('../models/Tupath_users');
const { User, Conversation, Message } = require('../models/messagingSchema');

// Get all conversations for a user
router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      'participants.userId': userId
    })
    .populate('lastMessage')
    .populate({
      path: 'participants.userId',
      select: 'username lastSeen'
    })
    .sort({ updatedAt: -1 });

    res.status(200).json({ 
      success: true, 
      conversations
    });
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    
    // Check if the user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId
    });
    
    if (!conversation) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have access to this conversation" 
      });
    }
    
    // Get all messages in this conversation
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    // Update unread count for this user in the conversation
    await Conversation.updateOne(
      { 
        _id: conversationId,
        'participants.userId': userId
      },
      { $set: { 'participants.$.unreadCount': 0 } }
    );
    
    res.status(200).json({
      success: true,
      messages
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create a new message
router.post("/messages", verifyToken, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;
    
    if (!conversationId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Conversation ID and message content are required" 
      });
    }
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': senderId
    });
    
    if (!conversation) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have access to this conversation" 
      });
    }
    
    // Create new message
    const message = new Message({
      conversationId,
      sender: senderId,
      content,
      readBy: [senderId] // Sender has read their own message
    });
    
    await message.save();
    
    // Update conversation's last message and update time
    conversation.lastMessage = message._id;
    
    // Increment unread count for all participants except sender
    conversation.participants.forEach(participant => {
      if (!participant.userId.equals(senderId)) {
        participant.unreadCount += 1;
      }
    });
    
    await conversation.save();
    
    // Populate sender info before sending response
    await message.populate('sender', 'username');
    
    // Emit with socket.io if available
    if (req.io) {
      req.io.to(conversationId).emit('new_message', message);
    }
    
    res.status(201).json({
      success: true,
      message
    });
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create a new conversation
router.post("/conversations", verifyToken, async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;
    
    if (!participantId) {
      return res.status(400).json({ 
        success: false, 
        message: "Participant ID is required" 
      });
    }
    
    // Check if user exists (participant could be student or employer)
    const participant = 
      await Tupath_usersModel.findById(participantId) || 
      await Employer_usersModel.findById(participantId);
    
    if (!participant) {
      return res.status(404).json({ 
        success: false, 
        message: "Participant not found" 
      });
    }
    
    // Check if conversation already exists between these users
    const existingConversation = await Conversation.findOne({
      'participants.userId': { $all: [userId, participantId] }
    });
    
    if (existingConversation) {
      return res.status(200).json({ 
        success: true, 
        conversation: existingConversation,
        message: "Conversation already exists"
      });
    }
    
    // Create user entries if they don't exist
    let currentUser = await User.findOne({ _id: userId });
    if (!currentUser) {
      const userInfo = await Tupath_usersModel.findById(userId) || await Employer_usersModel.findById(userId);
      const fullName = `${userInfo.profileDetails.firstName} ${userInfo.profileDetails.lastName}`;
      
      currentUser = new User({
        _id: userId,
        username: fullName
      });
      await currentUser.save();
    }
    
    let participantUser = await User.findOne({ _id: participantId });
    if (!participantUser) {
      const fullName = `${participant.profileDetails.firstName} ${participant.profileDetails.lastName}`;
      
      participantUser = new User({
        _id: participantId,
        username: fullName
      });
      await participantUser.save();
    }
    
    // Create new conversation
    const conversation = new Conversation({
      participants: [
        { userId: userId, unreadCount: 0 },
        { userId: participantId, unreadCount: 0 }
      ]
    });
    
    await conversation.save();
    
    // Populate participant info before sending response
    await conversation.populate({
      path: 'participants.userId',
      select: 'username lastSeen'
    });
    
    res.status(201).json({
      success: true,
      conversation
    });
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Search for users and employers
router.get("/search", verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: "Search query parameter is required" 
      });
    }
    
    const loggedInUserId = req.user.id;
    const regex = new RegExp(query, "i"); // Case-insensitive regex

    // Search for students
    const students = await Tupath_usersModel.find({
      $and: [
        {
          $or: [
            { "profileDetails.firstName": regex },
            { "profileDetails.lastName": regex },
            { "profileDetails.middleName": regex },
            { bestTag: regex },
          ],
        },
        { _id: { $ne: loggedInUserId } }, // Exclude the logged-in user
      ],
    }).select(
      "_id profileDetails.firstName profileDetails.lastName profileDetails.middleName profileDetails.profileImg bestTag role"
    );

    // Search for employers
    const employers = await Employer_usersModel.find({
      $and: [
        {
          $or: [
            { "profileDetails.firstName": regex },
            { "profileDetails.lastName": regex },
            { "profileDetails.middleName": regex },
            { "profileDetails.companyName": regex },
            { "profileDetails.industry": regex },
          ],
        },
        { _id: { $ne: loggedInUserId } }, // Exclude the logged-in user
      ],
    }).select(
      "_id profileDetails.firstName profileDetails.lastName profileDetails.middleName profileDetails.profileImg profileDetails.companyName profileDetails.industry role"
    );

    // Combine and send results
    const results = [...students, ...employers];
    
    res.status(200).json({ 
      success: true, 
      results,
      count: results.length
    });
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

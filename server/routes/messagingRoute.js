const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { Tupath_usersModel, Employer_usersModel } = require('../models/Tupath_users');
const { User, Conversation, Message } = require('../models/messagingSchema');

// Get all conversations for a user with proper display names
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
    .sort({ updatedAt: -1 })
    .lean(); // Convert to plain JS objects

    // Get additional user details for each conversation participant
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      // Find the other participant
      const otherParticipant = conv.participants.find(
        p => p.userId._id.toString() !== userId.toString()
      );
      
      // Find current user's participant data
      const currentParticipant = conv.participants.find(
        p => p.userId._id.toString() === userId.toString()
      );

      // Get additional details from either student or employer collection
      let profileDetails = null;
      const participantId = otherParticipant.userId._id;
      const studentUser = await Tupath_usersModel.findById(participantId).select('profileDetails.firstName profileDetails.lastName profileDetails.profileImg');
      const employerUser = await Employer_usersModel.findById(participantId).select('profileDetails.firstName profileDetails.lastName profileDetails.companyName profileDetails.profileImg');
      
      if (studentUser) {
        profileDetails = studentUser.profileDetails;
      } else if (employerUser) {
        profileDetails = employerUser.profileDetails;
      }

      return {
        _id: conv._id,
        displayName: otherParticipant.userId.username,
        lastMessage: conv.lastMessage,
        unreadCount: currentParticipant.unreadCount,
        updatedAt: conv.updatedAt,
        otherParticipantId: otherParticipant.userId._id,
        otherParticipant: {
          lastSeen: otherParticipant.userId.lastSeen,
          profileDetails: profileDetails // Include the profile details with image
        },
        participants: conv.participants // Keep the original participants array
      };
    }));

    res.status(200).json({ 
      success: true, 
      conversations: formattedConversations
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
      const messageObj = await message.populate('sender', 'username');
      req.io.to(conversationId).emit('new_message', {
        conversationId,
        message: messageObj
      });
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

// Create a new conversation with proper participant setup
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
    
    // Check if participant exists (student or employer)
    const participant = 
      await Tupath_usersModel.findById(participantId) || 
      await Employer_usersModel.findById(participantId);
    
    if (!participant) {
      return res.status(404).json({ 
        success: false, 
        message: "Participant not found" 
      });
    }
    
    // Check for existing conversation (sorted to prevent duplicates)
    const sortedIds = [userId, participantId].sort();
    const existingConversation = await Conversation.findOne({
      'participants.userId': { $all: sortedIds }
    });
    
    if (existingConversation) {
      // Format the existing conversation for consistent response
      await existingConversation.populate({
        path: 'participants.userId',
        select: 'username lastSeen'
      });
      
      const otherParticipant = existingConversation.participants.find(
        p => p.userId._id.toString() !== userId.toString()
      );
      
      return res.status(200).json({ 
        success: true, 
        conversation: {
          _id: existingConversation._id,
          displayName: otherParticipant.userId.username,
          lastMessage: existingConversation.lastMessage,
          unreadCount: 0,
          otherParticipantId: otherParticipant.userId._id
        },
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
      // Handle cases where profileDetails might be incomplete
      let fullName = "User";
      
      if (participant.profileDetails) {
        const firstName = participant.profileDetails.firstName || '';
        const lastName = participant.profileDetails.lastName || '';
        
        if (firstName || lastName) {
          fullName = `${firstName} ${lastName}`.trim();
        } else if (participant.profileDetails.companyName) {
          fullName = participant.profileDetails.companyName;
        }
      }
      
      participantUser = new User({
        _id: participantId,
        username: fullName
      });
      await participantUser.save();
    }
    
    // Create new conversation with sorted participant IDs
    const conversation = new Conversation({
      participants: [
        { userId: sortedIds[0], unreadCount: 0 },
        { userId: sortedIds[1], unreadCount: 0 }
      ]
    });
    
    await conversation.save();
    
    // Populate participant info
    await conversation.populate({
      path: 'participants.userId',
      select: 'username lastSeen'
    });
    
    // Format the response with displayName
    const otherParticipant = conversation.participants.find(
      p => p.userId._id.toString() !== userId.toString()
    );
    
    res.status(201).json({
      success: true,
      conversation: {
        _id: conversation._id,
        displayName: otherParticipant.userId.username,
        lastMessage: null,
        unreadCount: 0,
        otherParticipantId: otherParticipant.userId._id
      }
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

// Add new route for typing indicators
router.post("/typing", verifyToken, async (req, res) => {
  try {
    const { conversationId, isTyping } = req.body;
    const userId = req.user.id;
    
    if (!conversationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Conversation ID is required" 
      });
    }
    
    // Check if conversation exists and user is a participant
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
    
    // Emit typing indicator with socket.io if available
    if (req.io) {
      req.io.to(conversationId).emit('user_typing', {
        conversationId,
        isTyping,
        userId
      });
    }
    
    res.status(200).json({
      success: true
    });
  } catch (err) {
    console.error("Error with typing indicator:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Join a conversation (for socket.io)
router.post("/join", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;
    
    if (!conversationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Conversation ID is required" 
      });
    }
    
    // Check if conversation exists and user is a participant
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
    
    // If socket is available, join the room
    if (req.socket) {
      req.socket.join(conversationId);
    }
    
    res.status(200).json({
      success: true
    });
  } catch (err) {
    console.error("Error joining conversation:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Mark a specific message as read
router.put("/messages/:messageId/read", verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: "Message not found" 
      });
    }
    
    // Check if user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      'participants.userId': userId
    });
    
    if (!conversation) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have access to this message" 
      });
    }
    
    // Mark message as read if not already read
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
      
      // Update unread count in conversation
      await Conversation.updateOne(
        { 
          _id: message.conversationId,
          'participants.userId': userId
        },
        { $inc: { 'participants.$.unreadCount': -1 } }
      );
      
      // Emit message read event if socket.io is available
      if (req.io) {
        req.io.to(message.conversationId.toString()).emit('message_read', {
          messageId,
          userId
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Message marked as read"
    });
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

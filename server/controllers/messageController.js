const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');

// Create Conversation
const createConversation = async (req, res) => {
    const { userId1, userId2 } = req.body;

    try {
        // Check if users exist
        const user1 = await User.findById(userId1);
        const user2 = await User.findById(userId2);
        if (!user1 || !user2) {
            return res.status(404).json({ error: 'One or both users not found' });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [userId1, userId2] }
        });

        if (!conversation) {
            // Create new conversation
            conversation = await Conversation.create({
                participants: [userId1, userId2]
            });
        }

        return res.status(201).json(conversation);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Send Message
const sendMessage = async (req, res) => {
    const { conversationId, sender, content, media } = req.body;

    console.log(`Received conversationId: ${conversationId}`); // Log the conversationId {remove this line later}

    try {
        // Check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Create new message
        const message = await Message.create({
            conversationId,
            sender,
            content,
            media
        });

        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Fetch Messages with Pagination
const fetchMessages = async (req, res) => {
    const { conversationId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    console.log(`Received conversationId: ${conversationId}`); // Log the conversationId {remove this line later}

    try {
        // Check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Fetch messages with pagination
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update Message Status
const updateMessageStatus = async (req, res) => {
    const { messageId } = req.params;
    const { status } = req.body;

    console.log(`Received messageId: ${messageId}`); // Log the messageId {remove this line later}

    try {
        // Validate status value
        if (!['sent', 'delivered', 'read'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Update message status
        const message = await Message.findByIdAndUpdate(
            messageId,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        return res.status(200).json(message);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createConversation,
    sendMessage,
    fetchMessages,
    updateMessageStatus
};
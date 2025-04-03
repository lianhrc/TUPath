const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. User Schema (simplified)
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

// 2. Conversation Schema
const conversationSchema = new Schema({
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unreadCount: { type: Number, default: 0 }
  }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

// 3. Message Schema
const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Create and export models
const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { User, Conversation, Message };
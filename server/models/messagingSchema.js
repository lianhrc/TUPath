const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. User Schema (improved with display name support)
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String }, // Optional display name different from username
  lastSeen: { type: Date, default: Date.now },
  online: { type: Boolean, default: false }
}, { timestamps: true });

// 2. Conversation Schema (modified for two participants)
const conversationSchema = new Schema({
  participants: {
    type: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      unreadCount: { type: Number, default: 0 },
      // Add any participant-specific settings here
    }],
    validate: [participantsLimit, 'Conversation must have exactly 2 participants']
  },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

// Validate exactly 2 participants
function participantsLimit(val) {
  return val.length === 2;
}

// Add instance method to get the other participant
conversationSchema.methods.getOtherParticipant = function(currentUserId) {
  return this.participants.find(
    participant => !participant.userId.equals(currentUserId)
  );
};

// 3. Message Schema (optimized)
const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // Add delivery status if needed
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, { timestamps: true });

// Create and export models
const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { User, Conversation, Message };
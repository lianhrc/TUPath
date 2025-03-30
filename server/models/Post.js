const mongoose = require("mongoose");

// Define Post schema
const postSchema = new mongoose.Schema({
  userId: String,
  profileImg: String,
  name: String,
  timestamp: { type: Date, default: Date.now },
  content: String,
  postImg: String,
  upvotes: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
  votedUsers: [
    {
      userId: String,
      username: String,
      lastName: String,
    },
  ], // Array of users who upvoted
  comments: [
    {
      userId: String,
      profileImg: String,
      username: String,
      comment: String,
      createdAt: Date,
      deletedAt: { type: Date, default: null }, // Soft delete field
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;

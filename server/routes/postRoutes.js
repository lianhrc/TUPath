const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const verifyToken = require("../middleware/verifyToken"); // Assuming you'll move the middleware too

// Get all non-deleted posts with non-deleted comments
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // Default limit is 5 posts
    const skip = parseInt(req.query.skip) || 0;  // Default skip is 0
    
    const posts = await Post.find({ deletedAt: null }) // Exclude soft-deleted posts
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to a plain JavaScript object for manipulation

    // Filter out soft-deleted comments
    const filteredPosts = posts.map(post => ({
      ...post,
      comments: post.comments.filter(comment => !comment.deletedAt), // Only include non-deleted comments
    }));

    // Check if there are more posts available
    const total = await Post.countDocuments({ deletedAt: null });
    const hasMore = total > skip + posts.length;

    res.json({
      posts: filteredPosts,
      hasMore,
      total
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create a new post
router.post("/", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const userRole = req.user.role; // Extract role from the user token

  if (userRole !== "employer") {
    return res.status(403).json({ success: false, message: "Only employers can post." });
  }

  const { profileImg, name, content, postImg } = req.body;

  try {
    const newPost = new Post({
      profileImg,
      name,
      content,
      postImg,
      userId, // Save userId for the post
    });

    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
    
    // Socket emit logic will be handled in index.js
    req.io.emit("new_post", newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update a post
router.put("/:postId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.postId;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ success: false, message: "Post content cannot be empty" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    post.content = content;
    post.postImg = req.body.postImg;
    post.updatedAt = new Date();

    await post.save();

    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error("Error editing post:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Soft delete a post
router.delete("/:postId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.postId;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if the user is the one who created the post
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Perform a soft delete by setting the deletedAt field
    post.deletedAt = new Date();
    await post.save();

    // Socket emit will be handled in index.js
    req.io.emit("delete_post", { postId });

    // Respond with a success message
    res.status(200).json({ success: true, message: "Post soft deleted successfully" });
  } catch (err) {
    console.error("Error soft deleting post:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});

// Add a comment to a post
router.post("/:id/comment", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.id;
  const { profileImg, name, comment } = req.body;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const newComment = {
      profileImg,
      username: name,
      userId, // Include userId in the comment as a string
      comment,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Get the newly created comment with its MongoDB-assigned _id
    const savedComment = post.comments[post.comments.length - 1];

    // Socket emit will be handled in index.js
    req.io.emit("new_comment", { postId, comment: savedComment });

    // Return the complete comment object
    res.status(201).json({ success: true, comment: savedComment });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Soft delete a comment from a post
router.delete("/:postId/comment/:commentId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  try {
    // Find the post by ID, but only if it is not soft-deleted
    const post = await Post.findOne({ _id: postId, deletedAt: null });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found or deleted" });
    }

    // Find the comment
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const comment = post.comments[commentIndex];
    
    // Check if the user is the one who created the comment
    // Using toString() to ensure we compare strings correctly
    if (comment.userId && comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    // Set deletedAt timestamp or remove the comment
    // Option 1: Soft delete
    comment.deletedAt = new Date();
    
    // Option 2: Hard delete (alternative approach)
    // post.comments.splice(commentIndex, 1);

    // Save the updated post
    await post.save();

    // Socket emit will be handled in index.js
    req.io.emit("delete_comment", { postId, commentId });

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});

// Edit a comment on a post
router.put("/:postId/comment/:commentId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Find the comment to edit
    const existingComment = post.comments.find(
      (commentItem) => commentItem._id.toString() === commentId && commentItem.userId === userId
    );

    if (!existingComment) {
      return res.status(404).json({ success: false, message: "Comment not found or unauthorized" });
    }

    // Update the comment text
    existingComment.comment = comment;
    existingComment.updatedAt = new Date();

    // Save the updated post
    await post.save();

    // Socket emit will be handled in index.js
    req.io.emit("edit_comment", { postId, comment: existingComment });

    res.status(200).json({ success: true, comment: existingComment });
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Upvote/downvote a post
router.post("/:id/upvote", verifyToken, async (req, res) => {
  const postId = req.params.id;
  const { id: userId, username, lastName } = req.user; // Extract user info from token

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userIndex = post.votedUsers.findIndex((user) => user.userId === userId);

    if (userIndex > -1) {
      // User already upvoted, remove upvote
      post.votedUsers.splice(userIndex, 1);
      post.upvotes -= 1;
    } else {
      // User has not upvoted, add upvote
      post.votedUsers.push({ userId, username, lastName });
      post.upvotes += 1;
    }

    await post.save();

    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error("Error toggling upvote:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

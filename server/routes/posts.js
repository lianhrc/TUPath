const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Post } = require("../models/TupathUsers");
const { verifyToken } = require("../middleware/auth");

const JWT_SECRET = "your-secret-key";

// Add a comment to a post
router.post("/api/posts/:id/comment", verifyToken, async (req, res) => {
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
      userId, // Include userId in the comment
      comment,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    io.emit("new_comment", { postId, comment: newComment });

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete a comment from a post
router.delete("/api/posts/:postId/comment/:commentId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Find the comment to delete
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId && comment.userId === userId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: "Comment not found or unauthorized" });
    }

    // Remove the comment from the comments array
    post.comments.splice(commentIndex, 1);

    // Save the updated post
    await post.save();

    // Emit the comment deletion event
    io.emit("delete_comment", { postId, commentId });

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Edit a comment on a post
router.put("/api/posts/:postId/comment/:commentId", verifyToken, async (req, res) => {
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

    // Emit the comment edit event
    io.emit("edit_comment", { postId, comment: existingComment });

    res.status(200).json({ success: true, comment: existingComment });
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Increment upvotes for a post
router.post("/api/posts/:id/upvote", verifyToken, async (req, res) => {
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

// Get all posts
router.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create a new post
router.post("/api/posts", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
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
    io.emit("new_post", newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update a post
router.put("/api/posts/:postId", verifyToken, async (req, res) => {
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

// Delete a post
router.delete("/api/posts/:postId", verifyToken, async (req, res) => {
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

    // Delete the post using deleteOne
    const deletedPost = await Post.deleteOne({ _id: postId });

    // Check if a post was deleted
    if (deletedPost.deletedCount === 0) {
      return res.status(500).json({ success: false, message: "Failed to delete post" });
    }

    // Emit post deletion event (optional)
    io.emit("delete_post", { postId });

    // Respond with a success message
    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});

module.exports = router;

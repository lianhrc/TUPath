const Post = require('../models/postModel')
const User = require('../models/userModel')

// Create Post
const createPost = async (req, res) => {
    const userId = req.user.id // Extract user ID from the token
    const { postContent, media } = req.body

    try {
        // Check if user exists
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Ensure at least one content type is provided
        if (!postContent && !media) {
            return res.status(400).json({ error: 'Post must have content or media' })
        }

        // Create the post
        const post = await Post.create({
            userId,
            postContent,
            media
        })

        return res.status(201).json(post)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

// Read All Posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'name email').sort({ createdAt: -1 })
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

// Update Post
const updatePost = async (req, res) => {
    const { postId } = req.params
    const { postContent, media } = req.body

    try {
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }

        // Update fields
        post.postContent = postContent || post.postContent
        post.media = media || post.media
        await post.save()

        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

// Delete Post
const deletePost = async (req, res) => {
    const { postId } = req.params

    try {
        const post = await Post.findByIdAndDelete(postId)
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }
        return res.status(200).json({ message: 'Post deleted successfully' })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

// Vote Post
const votePost = async (req, res) => {
    const { postId } = req.params
    const userId = req.user.id // Extract user ID from the token

    try {
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }

        // Check if user has already voted
        const existingVoteIndex = post.likedUsers.findIndex(v => v.userId.toString() === userId)
        if (existingVoteIndex !== -1) {
            // Remove the existing vote
            post.likedUsers.splice(existingVoteIndex, 1)
        } else {
            // Add the new vote
            post.likedUsers.push({ userId })
        }

        await post.save()

        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

// Comment Post
const commentPost = async (req, res) => {
    const { postId } = req.params
    const userId = req.user.id // Extract user ID from the token
    const { comment } = req.body

    try {
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }

        // Validate comment
        if (!comment) {
            return res.status(400).json({ error: 'Comment is required' })
        }

        // Add the comment
        post.comments.push({ userId, comment })
        await post.save()

        return res.status(200).json(post)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    createPost,
    getAllPosts,
    updatePost,
    deletePost,
    votePost,
    commentPost
}

const express = require('express')
const { createPost, getAllPosts, updatePost, deletePost, votePost, commentPost } = require('../controllers/postController')
const verifyToken = require('../middleware/verifyToken')

const router = express.Router()

router.post('/', verifyToken, createPost)
router.get('/', getAllPosts)
router.put('/:id', verifyToken, updatePost)
router.delete('/:id', verifyToken, deletePost)
router.post('/:postId/vote', verifyToken, votePost)
router.post('/:postId/comment', verifyToken, commentPost)

module.exports = router
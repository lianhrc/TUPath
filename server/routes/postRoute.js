const express = require('express')

const { createPost, getAllPosts, updatePost, deletePost, votePost, commentPost } = require('../controllers/postController')

const router = express.Router()

router.post('/', createPost)
router.get('/', getAllPosts)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)
router.post('/:id/vote', votePost)
router.post('/:postId/comment', commentPost)

module.exports = router
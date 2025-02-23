const express = require('express')
const { createConversation, sendMessage, fetchMessages, updateMessageStatus } = require('../controllers/messageController')
const verifyToken = require('../middleware/verifyToken')

const router = express.Router()

router.post('/', verifyToken, createConversation)
router.post('/message', verifyToken, sendMessage)
router.get('/:conversationId/messages', verifyToken, fetchMessages)
router.put('/:messageId/status', verifyToken, updateMessageStatus)

module.exports = router
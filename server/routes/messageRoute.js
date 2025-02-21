const express = require('express');
const {createConversation, sendMessage, fetchMessages, updateMessageStatus } = require('../controllers/messageController');

const router = express.Router();

router.post('/', createConversation);
router.post('/message', sendMessage);
router.get('/:conversationId/messages', fetchMessages);
router.put('/:messageId/status', updateMessageStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');

// Get messages by language (query param: ?language=ar or ?language=en)
router.get('/', MessageController.getMessages);

// Get all messages in both languages
router.get('/all', MessageController.getAllMessages);

// Get specific message by key
router.get('/key/:key', MessageController.getMessageByKey);

module.exports = router;
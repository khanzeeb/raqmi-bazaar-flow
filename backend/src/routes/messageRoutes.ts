import express from 'express';
import MessageController from '../controllers/messageController';

const router = express.Router();

// Get messages by language (query param: ?language=ar or ?language=en)
router.get('/', MessageController.getMessages);

// Get all messages in both languages
router.get('/all', MessageController.getAllMessages);

// Get specific message by key
router.get('/key/:key', MessageController.getMessageByKey);

export default router;
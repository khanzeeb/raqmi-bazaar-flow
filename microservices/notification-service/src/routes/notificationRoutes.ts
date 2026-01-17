import express from 'express';
import NotificationController from '../controllers/NotificationController';
import { notificationValidators } from '../validators/notificationValidators';

const router = express.Router();

// Create notifications
router.post('/', notificationValidators.create, NotificationController.createNotification);
router.post('/from-template', notificationValidators.createFromTemplate, NotificationController.createFromTemplate);
router.post('/bulk', notificationValidators.createBulk, NotificationController.createBulkNotifications);

// Get notifications
router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/:id', NotificationController.getNotification);

// Update notifications
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/mark-all-read', notificationValidators.markAllRead, NotificationController.markAllAsRead);

// Delete notifications
router.delete('/:id', NotificationController.deleteNotification);
router.post('/cleanup', notificationValidators.cleanup, NotificationController.cleanupOldNotifications);

export default router;

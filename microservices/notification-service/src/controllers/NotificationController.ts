import { Request, Response, NextFunction } from 'express';
import { BaseController, AuthenticatedRequest } from '../common/BaseController';
import NotificationService from '../services/NotificationService';

class NotificationController extends BaseController {
  async createNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationService.create(req.body),
      req.language === 'ar' ? 'تم إنشاء الإشعار بنجاح' : 'Notification created successfully',
      'Failed to create notification',
      201
    );
  }

  async createFromTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationService.createFromTemplate(req.body),
      req.language === 'ar' ? 'تم إنشاء الإشعار من القالب بنجاح' : 'Notification created from template successfully',
      'Failed to create notification from template',
      201
    );
  }

  async createBulkNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationService.createBulk(req.body),
      req.language === 'ar' ? 'تم إنشاء الإشعارات بنجاح' : 'Notifications created successfully',
      'Failed to create bulk notifications',
      201
    );
  }

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationService.getAll(req.query),
      'Notifications retrieved successfully',
      'Failed to retrieve notifications'
    );
  }

  async getNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationService.getById(req.params.id),
      'Notification retrieved successfully',
      'Failed to retrieve notification'
    );
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationService.markAsRead(req.params.id),
      req.language === 'ar' ? 'تم تحديد الإشعار كمقروء' : 'Notification marked as read',
      'Failed to mark notification as read'
    );
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { user_id, organization_id } = req.body;
    
    await this.executeOperation(
      req,
      res,
      async () => {
        const count = await NotificationService.markAllAsRead(user_id, organization_id);
        return { marked_count: count };
      },
      req.language === 'ar' ? 'تم تحديد جميع الإشعارات كمقروءة' : 'All notifications marked as read',
      'Failed to mark all notifications as read'
    );
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { user_id, organization_id } = req.query;
    
    await this.executeOperation(
      req,
      res,
      async () => {
        const count = await NotificationService.getUnreadCount(user_id as string, organization_id as string);
        return { unread_count: count };
      },
      'Unread count retrieved successfully',
      'Failed to retrieve unread count'
    );
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        await NotificationService.delete(req.params.id);
        return { deleted: true };
      },
      req.language === 'ar' ? 'تم حذف الإشعار بنجاح' : 'Notification deleted successfully',
      'Failed to delete notification'
    );
  }

  async cleanupOldNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { days_old } = req.body;
    
    await this.executeOperation(
      req,
      res,
      async () => {
        const count = await NotificationService.deleteOldNotifications(days_old || 30);
        return { deleted_count: count };
      },
      req.language === 'ar' ? 'تم تنظيف الإشعارات القديمة' : 'Old notifications cleaned up successfully',
      'Failed to cleanup old notifications'
    );
  }
}

export default new NotificationController();

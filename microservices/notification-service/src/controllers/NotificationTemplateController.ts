import { Request, Response, NextFunction } from 'express';
import { BaseController, AuthenticatedRequest } from '../common/BaseController';
import NotificationTemplateService from '../services/NotificationTemplateService';

class NotificationTemplateController extends BaseController {
  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationTemplateService.create(req.body),
      req.language === 'ar' ? 'تم إنشاء القالب بنجاح' : 'Template created successfully',
      'Failed to create template',
      201
    );
  }

  async getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationTemplateService.getAll(req.query),
      'Templates retrieved successfully',
      'Failed to retrieve templates'
    );
  }

  async getTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationTemplateService.getById(req.params.id),
      'Template retrieved successfully',
      'Failed to retrieve template'
    );
  }

  async getTemplateByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code } = req.params;
    const { organization_id } = req.query;
    
    await this.executeOperation(
      req,
      res,
      () => NotificationTemplateService.getByCode(code, organization_id as string),
      'Template retrieved successfully',
      'Failed to retrieve template'
    );
  }

  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      () => NotificationTemplateService.update(req.params.id, req.body),
      req.language === 'ar' ? 'تم تحديث القالب بنجاح' : 'Template updated successfully',
      'Failed to update template'
    );
  }

  async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    await this.executeOperation(
      req,
      res,
      async () => {
        await NotificationTemplateService.delete(req.params.id);
        return { deleted: true };
      },
      req.language === 'ar' ? 'تم حذف القالب بنجاح' : 'Template deleted successfully',
      'Failed to delete template'
    );
  }
}

export default new NotificationTemplateController();

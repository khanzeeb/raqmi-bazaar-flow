import express from 'express';
import NotificationTemplateController from '../controllers/NotificationTemplateController';
import { templateValidators } from '../validators/templateValidators';

const router = express.Router();

router.post('/', templateValidators.create, NotificationTemplateController.createTemplate);
router.get('/', NotificationTemplateController.getTemplates);
router.get('/code/:code', NotificationTemplateController.getTemplateByCode);
router.get('/:id', NotificationTemplateController.getTemplate);
router.put('/:id', templateValidators.update, NotificationTemplateController.updateTemplate);
router.delete('/:id', NotificationTemplateController.deleteTemplate);

export default router;

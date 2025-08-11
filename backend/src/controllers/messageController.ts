import { Request, Response } from 'express';
import MessageService from '../services/messageService';

class MessageController {
  // Get all messages for a specific language
  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { language = 'en' } = req.query as { language?: string };
      const messages = MessageService.getMessages(language);
      
      res.json({
        success: true,
        data: messages,
        language
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        message: MessageService.getMessage('server.error', req.query.language as string),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all messages in both languages
  static async getAllMessages(req: Request, res: Response): Promise<void> {
    try {
      const messages = MessageService.getAllMessages();
      
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Error fetching all messages:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get a specific message by key
  static async getMessageByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { language = 'en' } = req.query as { language?: string };
      
      const message = MessageService.getMessage(key, language);
      
      res.json({
        success: true,
        data: {
          key,
          message,
          language
        }
      });
    } catch (error) {
      console.error('Error fetching message:', error);
      res.status(500).json({
        success: false,
        message: MessageService.getMessage('server.error', req.query.language as string),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default MessageController;
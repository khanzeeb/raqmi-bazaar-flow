const MessageService = require('../services/messageService');

class MessageController {
  // Get all messages for a specific language
  static async getMessages(req, res) {
    try {
      const { language = 'en' } = req.query;
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
        message: MessageService.getMessage('server.error', req.query.language),
        error: error.message
      });
    }
  }

  // Get all messages in both languages
  static async getAllMessages(req, res) {
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
        error: error.message
      });
    }
  }

  // Get a specific message by key
  static async getMessageByKey(req, res) {
    try {
      const { key } = req.params;
      const { language = 'en' } = req.query;
      
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
        message: MessageService.getMessage('server.error', req.query.language),
        error: error.message
      });
    }
  }
}

module.exports = MessageController;
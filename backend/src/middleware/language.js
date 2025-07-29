const MessageService = require('../services/messageService');

// Middleware to extract language from request and add helper methods
const languageMiddleware = (req, res, next) => {
  // Extract language from query param, header, or default to 'en'
  const language = req.query.language || 
                   req.headers['accept-language']?.includes('ar') ? 'ar' : 'en' ||
                   'en';
  
  // Add language to request object
  req.language = language;
  
  // Add helper methods to response object
  res.successMessage = (messageKey, data = null) => {
    return res.json(MessageService.successResponse(messageKey, data, language));
  };
  
  res.errorMessage = (messageKey, data = null, statusCode = 400) => {
    return res.status(statusCode).json(MessageService.errorResponse(messageKey, data, language));
  };
  
  res.message = (messageKey) => {
    return MessageService.getMessage(messageKey, language);
  };
  
  next();
};

module.exports = languageMiddleware;
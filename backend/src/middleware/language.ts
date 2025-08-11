import { Request, Response, NextFunction } from 'express';
import MessageService from '../services/messageService';

interface LanguageRequest extends Request {
  language?: string;
}

interface LanguageResponse extends Response {
  successMessage?: (messageKey: string, data?: any) => Response;
  errorMessage?: (messageKey: string, data?: any, statusCode?: number) => Response;
  message?: (messageKey: string) => string;
}

// Middleware to extract language from request and add helper methods
const languageMiddleware = (req: LanguageRequest, res: LanguageResponse, next: NextFunction): void => {
  // Extract language from query param, header, or default to 'en'
  const language = req.query.language as string || 
                   (req.headers['accept-language']?.includes('ar') ? 'ar' : 'en') ||
                   'en';
  
  // Add language to request object
  req.language = language;
  
  // Add helper methods to response object
  res.successMessage = (messageKey: string, data: any = null) => {
    return res.json(MessageService.successResponse(messageKey, data, language));
  };
  
  res.errorMessage = (messageKey: string, data: any = null, statusCode: number = 400) => {
    return res.status(statusCode).json(MessageService.errorResponse(messageKey, data, language));
  };
  
  res.message = (messageKey: string) => {
    return MessageService.getMessage(messageKey, language);
  };
  
  next();
};

export default languageMiddleware;
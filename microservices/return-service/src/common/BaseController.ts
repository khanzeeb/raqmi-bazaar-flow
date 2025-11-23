import { Request, Response, NextFunction } from 'express';

export abstract class BaseController {
  protected handleError(error: any, res: Response): void {
    console.error('Controller Error:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }

  protected success(res: Response, data: any, message?: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  protected created(res: Response, data: any, message?: string): void {
    this.success(res, data, message, 201);
  }

  protected noContent(res: Response): void {
    res.status(204).send();
  }
}

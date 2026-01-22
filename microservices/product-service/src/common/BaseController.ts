// Base Controller - Common response handling for Express controllers
import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export abstract class BaseController {
  protected sendSuccess<T>(res: Response, data: T, message: string, statusCode = 200): void {
    res.status(statusCode).json({ success: true, message, data });
  }

  protected sendCreated<T>(res: Response, data: T, message: string): void {
    this.sendSuccess(res, data, message, 201);
  }

  protected sendNotFound(res: Response, resource = 'Resource'): void {
    res.status(404).json({ success: false, message: `${resource} not found` });
  }

  protected sendError(res: Response, message: string, statusCode = 500): void {
    res.status(statusCode).json({ success: false, message });
  }

  protected sendBadRequest(res: Response, message: string): void {
    this.sendError(res, message, 400);
  }

  protected async executeOperation<T>(
    req: Request, res: Response, next: NextFunction,
    operation: () => Promise<T>,
    successMessage: string,
    successStatusCode = 200
  ): Promise<void> {
    try {
      const result = await operation();
      if (result === null || result === undefined) {
        this.sendNotFound(res);
        return;
      }
      this.sendSuccess(res, result, successMessage, successStatusCode);
    } catch (error) {
      next(error);
    }
  }

  protected async executeDelete(
    req: Request, res: Response, next: NextFunction,
    operation: () => Promise<boolean>,
    successMessage: string
  ): Promise<void> {
    try {
      const success = await operation();
      if (!success) {
        this.sendNotFound(res);
        return;
      }
      this.sendSuccess(res, { deleted: true }, successMessage);
    } catch (error) {
      next(error);
    }
  }

  protected getPaginationDefaults(query: any) {
    return {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10
    };
  }
}

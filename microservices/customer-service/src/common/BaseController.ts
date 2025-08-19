import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export abstract class BaseController {
  protected handleValidationErrors(req: Request, res: Response): boolean {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return true;
    }
    return false;
  }

  protected handleSuccess(res: Response, data: any, message = 'Operation successful', statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  protected handleError(res: Response, error: any, message = 'Operation failed', statusCode = 500): void {
    console.error(`${message}:`, error);
    res.status(statusCode).json({
      success: false,
      message
    });
  }

  protected handleNotFound(res: Response, resource = 'Resource'): void {
    res.status(404).json({
      success: false,
      message: `${resource} not found`
    });
  }

  protected async executeOperation<T>(
    req: Request,
    res: Response,
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    statusCode = 200
  ): Promise<void> {
    try {
      if (this.handleValidationErrors(req, res)) {
        return;
      }

      const result = await operation();
      
      if (result === null || result === undefined) {
        this.handleNotFound(res);
        return;
      }

      this.handleSuccess(res, result, successMessage, statusCode);
    } catch (error) {
      this.handleError(res, error, errorMessage);
    }
  }
}
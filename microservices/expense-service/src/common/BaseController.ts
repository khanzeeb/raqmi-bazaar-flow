import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export abstract class BaseController {
  protected handleSuccess(res: Response, data: any, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  protected handleError(res: Response, error: any, statusCode: number = 500) {
    console.error('Controller Error:', error);
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }

  protected asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  protected validateRequest(req: Request, res: Response): boolean {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
      return false;
    }
    return true;
  }
}

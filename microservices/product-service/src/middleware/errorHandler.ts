import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public field?: string;

  constructor(message: string, statusCode = 500, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, field);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'A record with this value already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${req.method}] ${req.path} - Error:`, error.message);

  // Known application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      field: error.field
    });
  }

  // Knex/PostgreSQL errors
  if ((error as any).code) {
    const dbError = error as any;
    
    // Unique constraint violation
    if (dbError.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A record with this value already exists'
      });
    }
    
    // Foreign key violation
    if (dbError.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Referenced record does not exist'
      });
    }
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
};

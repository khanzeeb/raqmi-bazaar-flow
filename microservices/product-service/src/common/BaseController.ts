// Base Controller - Common response handling for all controllers
import { FastifyRequest, FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export abstract class BaseController {
  /**
   * Send success response
   */
  protected sendSuccess<T>(
    reply: FastifyReply,
    data: T,
    message: string,
    statusCode = 200
  ): void {
    reply.status(statusCode).send({
      success: true,
      message,
      data
    });
  }

  /**
   * Send created response (201)
   */
  protected sendCreated<T>(reply: FastifyReply, data: T, message: string): void {
    this.sendSuccess(reply, data, message, 201);
  }

  /**
   * Send not found response
   */
  protected sendNotFound(reply: FastifyReply, resource = 'Resource'): void {
    reply.status(404).send({
      success: false,
      message: `${resource} not found`
    });
  }

  /**
   * Send error response
   */
  protected sendError(
    reply: FastifyReply,
    message: string,
    statusCode = 500,
    error?: any
  ): void {
    reply.status(statusCode).send({
      success: false,
      message,
      error: error?.message
    });
  }

  /**
   * Send validation error
   */
  protected sendBadRequest(reply: FastifyReply, message: string): void {
    this.sendError(reply, message, 400);
  }

  /**
   * Execute operation with standard error handling
   */
  protected async executeOperation<T>(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    successStatusCode = 200
  ): Promise<void> {
    try {
      const result = await operation();
      
      if (result === null || result === undefined) {
        this.sendNotFound(reply);
        return;
      }

      this.sendSuccess(reply, result, successMessage, successStatusCode);
    } catch (error: any) {
      request.log.error(error);
      this.sendError(reply, error.message || errorMessage, error.statusCode || 500);
    }
  }

  /**
   * Execute delete operation with standard handling
   */
  protected async executeDelete(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: () => Promise<boolean>,
    successMessage: string,
    notFoundMessage: string,
    errorMessage: string
  ): Promise<void> {
    try {
      const success = await operation();
      
      if (!success) {
        this.sendNotFound(reply, notFoundMessage);
        return;
      }

      this.sendSuccess(reply, { deleted: true }, successMessage);
    } catch (error: any) {
      request.log.error(error);
      this.sendError(reply, error.message || errorMessage);
    }
  }

  /**
   * Standard pagination defaults
   */
  protected getPaginationDefaults(query: any) {
    return {
      page: query.page || 1,
      limit: query.limit || 10
    };
  }
}

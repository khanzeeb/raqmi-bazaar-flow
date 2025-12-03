// Error Handler Plugin - Single Responsibility: Error handling only

import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { ValidationError } from '../validators/ProductValidator';

async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    // Custom validation errors from validators
    if (error instanceof ValidationError || error.name === 'ValidationError') {
      return reply.status(400).send({
        success: false,
        message: error.message
      });
    }

    // Fastify validation errors (from TypeBox schemas)
    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        success: false,
        message: 'Validation Error',
        errors: (error as FastifyError).validation
      });
    }

    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any;
      if (prismaError.code === 'P2002') {
        return reply.status(409).send({
          success: false,
          message: 'A record with this value already exists'
        });
      }
      if (prismaError.code === 'P2025') {
        return reply.status(404).send({
          success: false,
          message: 'Record not found'
        });
      }
    }

    // Not found errors
    const statusCode = 'statusCode' in error ? (error as FastifyError).statusCode : undefined;
    if (statusCode === 404) {
      return reply.status(404).send({
        success: false,
        message: error.message || 'Resource not found'
      });
    }

    // Default error
    return reply.status(statusCode || 500).send({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  });

  // Not found handler
  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      success: false,
      message: `Endpoint ${request.url} not found`
    });
  });
}

export const errorHandler = fp(errorHandlerPlugin);

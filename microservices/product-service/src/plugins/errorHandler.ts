import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    // Validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        message: 'Validation Error',
        errors: error.validation
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
    if (error.statusCode === 404) {
      return reply.status(404).send({
        success: false,
        message: error.message || 'Resource not found'
      });
    }

    // Default error
    return reply.status(error.statusCode || 500).send({
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

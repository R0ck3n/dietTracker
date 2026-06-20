import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError, type ZodSchema } from 'zod';
import { AppError } from '../lib/errors.js';

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map((issue) => issue.message).join(', ');
      throw new AppError(message, 400, 'VALIDATION_ERROR');
    }
    throw error;
  }
}

export function parseQuery<T>(schema: ZodSchema<T>, query: unknown): T {
  return parseBody(schema, query);
}

export function requireUser(request: FastifyRequest): { userId: number; username: string } {
  const userId = request.session.userId;
  const username = request.session.username;

  if (!userId || !username) {
    throw new AppError('Authentification requise.', 401, 'UNAUTHORIZED');
  }

  return { userId, username };
}

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  requireUser(request);
}

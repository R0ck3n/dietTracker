import type { FastifyInstance } from 'fastify';
import { authenticate, parseBody, requireUser } from '../plugins/auth.js';
import { parseDateParam } from '../lib/dates.js';
import { loginSchema, registerSchema, confirmPasswordSchema } from '../schemas/index.js';
import { AuthService } from '../services/auth.service.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authService = new AuthService();

  fastify.post('/auth/login', async (request, reply) => {
    const body = parseBody(loginSchema, request.body);
    const user = await authService.login(body.username, body.password);

    request.session.userId = user.userId;
    request.session.username = user.username;

    return reply.send({ user });
  });

  fastify.get('/auth/status', async () => {
    return { hasUser: authService.hasUser() };
  });

  fastify.post('/auth/register', async (request, reply) => {
    const body = parseBody(registerSchema, request.body);
    const user = await authService.register(body.username, body.password);

    request.session.userId = user.userId;
    request.session.username = user.username;

    return reply.status(201).send({ user });
  });

  fastify.post('/auth/logout', { preHandler: authenticate }, async (request, reply) => {
    await request.session.destroy();
    reply.clearCookie('sessionId', { path: '/' });
    return reply.send({ ok: true });
  });

  fastify.get('/auth/me', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    return { user: authService.getProfile(userId) };
  });

  fastify.delete('/auth/data', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const body = parseBody(confirmPasswordSchema, request.body);
    await authService.deleteUserData(userId, body.password);
    return { ok: true };
  });

  fastify.delete('/auth/account', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = requireUser(request);
    const body = parseBody(confirmPasswordSchema, request.body);
    await authService.deleteAccount(userId, body.password);
    await request.session.destroy();
    reply.clearCookie('sessionId', { path: '/' });
    return { ok: true };
  });
}

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async () => ({ status: 'ok' }));
}

export { parseDateParam };

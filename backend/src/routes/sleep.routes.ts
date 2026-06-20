import type { FastifyInstance } from 'fastify';
import { parseDateParam } from '../lib/dates.js';
import { authenticate, parseBody, requireUser } from '../plugins/auth.js';
import { idParamSchema, sleepInputSchema } from '../schemas/index.js';
import { SleepService } from '../services/sleep.service.js';

export async function sleepRoutes(fastify: FastifyInstance): Promise<void> {
  const sleepService = new SleepService();

  fastify.post('/journal/:date/sleep', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = requireUser(request);
    const { date } = request.params as { date: string };
    const body = parseBody(sleepInputSchema, request.body);
    const sleep = sleepService.upsertForDate(userId, parseDateParam(date), body);
    return reply.status(201).send(sleep);
  });

  fastify.put('/sleep/:id', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const { id } = request.params as { id: string };
    const sleepId = idParamSchema.parse(id);
    const body = parseBody(sleepInputSchema, request.body);
    return sleepService.update(userId, sleepId, body);
  });
}

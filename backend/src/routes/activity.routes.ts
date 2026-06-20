import type { FastifyInstance } from 'fastify';
import { parseDateParam } from '../lib/dates.js';
import { authenticate, parseBody, requireUser } from '../plugins/auth.js';
import { activityInputSchema, idParamSchema } from '../schemas/index.js';
import { ActivityService } from '../services/activity.service.js';

export async function activityRoutes(fastify: FastifyInstance): Promise<void> {
  const activityService = new ActivityService();

  fastify.post('/journal/:date/activities', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = requireUser(request);
    const { date } = request.params as { date: string };
    const body = parseBody(activityInputSchema, request.body);
    const activity = activityService.add(userId, parseDateParam(date), body);
    return reply.status(201).send(activity);
  });

  fastify.put('/activities/:id', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const { id } = request.params as { id: string };
    const activityId = idParamSchema.parse(id);
    const body = parseBody(activityInputSchema, request.body);
    return activityService.update(userId, activityId, body);
  });

  fastify.delete('/activities/:id', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = requireUser(request);
    const { id } = request.params as { id: string };
    const activityId = idParamSchema.parse(id);
    activityService.delete(userId, activityId);
    return reply.status(204).send();
  });
}

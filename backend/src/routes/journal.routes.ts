import type { FastifyInstance } from 'fastify';
import { parseDateParam } from '../lib/dates.js';
import { authenticate, parseBody, requireUser } from '../plugins/auth.js';
import {
  createJournalSchema,
  statsQuerySchema,
  updateHydrationSchema,
  updateJournalSchema,
  updateWeightSchema,
} from '../schemas/index.js';
import { JournalService } from '../services/journal.service.js';

export async function journalRoutes(fastify: FastifyInstance): Promise<void> {
  const journalService = new JournalService();

  fastify.get('/journal/:date', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const { date } = request.params as { date: string };
    return journalService.getDay(userId, parseDateParam(date));
  });

  fastify.post('/journal', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const body = parseBody(createJournalSchema, request.body);
    return journalService.createDay(userId, parseDateParam(body.date));
  });

  fastify.put('/journal/:date', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const { date } = request.params as { date: string };
    const body = parseBody(updateJournalSchema, request.body);
    return journalService.updateDay(userId, parseDateParam(date), body.notes);
  });

  fastify.patch('/journal/:date/weight', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const { date } = request.params as { date: string };
    const body = parseBody(updateWeightSchema, request.body);
    return journalService.updateWeight(userId, parseDateParam(date), body.weight);
  });

  fastify.patch('/journal/:date/hydration', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const { date } = request.params as { date: string };
    const body = parseBody(updateHydrationSchema, request.body);
    return journalService.updateHydration(userId, parseDateParam(date), body.hydrationLiters);
  });

  fastify.get('/stats', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const query = parseBody(statsQuerySchema, request.query);
    return {
      from: query.from,
      to: query.to,
      days: journalService.getStats(userId, query.from, query.to),
    };
  });
}

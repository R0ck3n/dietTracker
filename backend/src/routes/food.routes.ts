import type { FastifyInstance } from 'fastify';
import { parseDateParam } from '../lib/dates.js';
import { authenticate, parseBody, requireUser } from '../plugins/auth.js';
import { foodInputSchema, idParamSchema } from '../schemas/index.js';
import { FoodService } from '../services/food.service.js';

export async function foodRoutes(fastify: FastifyInstance): Promise<void> {
  const foodService = new FoodService();

  fastify.post('/journal/:date/foods', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = requireUser(request);
    const { date } = request.params as { date: string };
    const body = parseBody(foodInputSchema, request.body);
    const food = foodService.add(userId, parseDateParam(date), body);
    return reply.status(201).send(food);
  });

  fastify.put('/foods/:id', { preHandler: authenticate }, async (request) => {
    const { userId } = requireUser(request);
    const { id } = request.params as { id: string };
    const foodId = idParamSchema.parse(id);
    const body = parseBody(foodInputSchema, request.body);
    return foodService.update(userId, foodId, body);
  });

  fastify.delete('/foods/:id', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = requireUser(request);
    const { id } = request.params as { id: string };
    const foodId = idParamSchema.parse(id);
    foodService.delete(userId, foodId);
    return reply.status(204).send();
  });
}

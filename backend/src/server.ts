import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import session from '@fastify/session';
import { env } from './config/env.js';
import { initDatabase, closeDatabase } from './db/connection.js';
import { isAppError } from './lib/errors.js';
import { authRoutes, healthRoutes } from './routes/auth.routes.js';
import { journalRoutes } from './routes/journal.routes.js';
import { foodRoutes } from './routes/food.routes.js';
import { activityRoutes } from './routes/activity.routes.js';
import { sleepRoutes } from './routes/sleep.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: env.isProduction,
  });

  app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
  });

  app.register(cookie);
  app.register(session, {
    secret: env.sessionSecret,
    cookieName: 'sessionId',
    cookie: {
      secure: env.isProduction,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    },
    saveUninitialized: false,
  });

  app.setErrorHandler((error, _request, reply) => {
    if (isAppError(error)) {
      return reply.status(error.statusCode).send({
        error: error.code ?? 'APP_ERROR',
        message: error.message,
      });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = Number((error as { statusCode: number }).statusCode);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
      return reply.status(statusCode).send({
        error: 'REQUEST_ERROR',
        message,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      error: 'INTERNAL_ERROR',
      message: 'Une erreur interne est survenue.',
    });
  });

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(journalRoutes);
  app.register(foodRoutes);
  app.register(activityRoutes);
  app.register(sleepRoutes);

  return app;
}

async function start(): Promise<void> {
  initDatabase();

  const app = buildApp();

  try {
    await app.listen({ port: env.port, host: env.host });
    console.log(`API Diet Tracker démarrée sur http://${env.host}:${env.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    closeDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();

import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databasePath: resolve(process.cwd(), process.env.DATABASE_PATH ?? '../data/diettracker.db'),
  sessionSecret: required('SESSION_SECRET', 'dev-only-change-me-before-production'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  cookieSecure:
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : (process.env.NODE_ENV ?? 'development') === 'production',
};

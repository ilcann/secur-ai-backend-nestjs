import { registerAs } from '@nestjs/config';
import { BullRootModuleOptions } from '@nestjs/bullmq';

export const bullConfig = registerAs('bull', (): BullRootModuleOptions => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const attempts = process.env.BULL_DEFAULT_ATTEMPTS
    ? parseInt(process.env.BULL_DEFAULT_ATTEMPTS, 10)
    : 1;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not defined.');
  }

  return {
    connection: { url: redisUrl },
    defaultJobOptions: { attempts },
  };
});
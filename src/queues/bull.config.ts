import { BullModule } from '@nestjs/bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const bullConfig = BullModule.forRoot({
  connection: { url: redisUrl },
  defaultJobOptions: { attempts: 1 },
});

export { bullConfig };

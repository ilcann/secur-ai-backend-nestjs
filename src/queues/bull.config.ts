import { BullModule } from '@nestjs/bullmq';

const bullConfig = BullModule.forRoot({
  // TODO: Redis connection options proces.env not working
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  defaultJobOptions: { attempts: 1 },
});

export default bullConfig;

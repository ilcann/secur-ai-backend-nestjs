import { Module } from '@nestjs/common';
import { UsageTrackingService } from './usage-tracking.service';

@Module({
  providers: [UsageTrackingService],
})
export class LlmUsageModule {}

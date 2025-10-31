import { Module } from '@nestjs/common';
import { UsageTrackingService } from './usage-tracking.service';

@Module({
  providers: [UsageTrackingService],
  exports: [UsageTrackingService],
})
export class LlmUsageModule {}

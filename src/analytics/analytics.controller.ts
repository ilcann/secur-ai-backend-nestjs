import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';

@ApiTags('Analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get general dashboard statistics for the organization',
  })
  async getDashboardStats(): Promise<ControllerResponse<any>> {
    const stats = await this.analyticsService.getDashboardStats();

    return {
      data: stats,
      message: 'Dashboard statistics retrieved successfully',
    };
  }
}

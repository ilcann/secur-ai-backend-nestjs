import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecordUsageDto } from './dto/record-usage.dto';
import { TokenType } from '@prisma/client';

@Injectable()
export class UsageTrackingService {
  constructor(private prismaService: PrismaService) {}

  async recordUsage(dto: RecordUsageDto) {
    if (
      dto.ResponseUsage &&
      dto.ResponseUsage.input_tokens !== 0 &&
      dto.ResponseUsage.output_tokens !== 0
    ) {
      await this.prismaService.aiUsage.create({
        data: {
          userId: dto.userId,
          modelId: dto.modelId,
          tokenType: TokenType.INPUT,
          tokens: dto.ResponseUsage ? dto.ResponseUsage.input_tokens : 0,
        },
      });
      await this.prismaService.aiUsage.create({
        data: {
          userId: dto.userId,
          modelId: dto.modelId,
          tokenType: TokenType.OUTPUT,
          tokens: dto.ResponseUsage ? dto.ResponseUsage.output_tokens : 0,
        },
      });
    }
  }
}

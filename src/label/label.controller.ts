import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';
import { LabelService } from './label.service';
import { LabelDto } from './dto/label.dto';
import { LabelMapper } from './label.mapper';
import { CreateLabelDto } from './dto/create-label.dto';
import { SyncResponseDto } from './dto/sync-response';

@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get()
  async getLabels(): Promise<ControllerResponse<{ labels: LabelDto[] }>> {
    const labels = await this.labelService.getLabels();
    const labelsDto: LabelDto[] = labels.map((label) =>
      LabelMapper.toDto(label),
    );

    return {
      data: { labels: labelsDto },
      message: 'Labels fetched successfully',
    };
  }

  @Post()
  async createLabel(@Body() dto: CreateLabelDto) {
    const existingLabel = await this.labelService.findOne({ key: dto.key });
    if (existingLabel) {
      throw new ConflictException(`Label with key ${dto.key} already exists`);
    }

    const label = await this.labelService.createLabel(dto);
    const labelDto = LabelMapper.toDto(label);

    return {
      data: { label: labelDto },
      message: 'Label created successfully',
    };
  }

  @Post('sync')
  async syncLabels(): Promise<ControllerResponse<SyncResponseDto>> {
    const syncResult = await this.labelService.syncLabels();
    return {
      data: syncResult,
      message: 'Labels synced successfully',
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';

@Controller('label')
export class LabelController {
  constructor() { }

  @Get()
  getLabels(): Promise<ControllerResponse<{ labels: string[] }>> {
    return Promise.resolve({
      data: { labels: ['label1', 'label2', 'label3'] },
      message: 'Labels fetched successfully',
    });
  }
}

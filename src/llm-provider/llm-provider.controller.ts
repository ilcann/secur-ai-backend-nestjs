import { Body, Controller, Post } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { LlmProviderService } from './llm-provider.service';
import { ProviderMapper } from 'src/ai/mapper/provider.mapper';
import { ProviderDto } from 'src/ai/dto/provider.dto';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';

@Controller('llm-provider')
export class LlmProviderController {
  constructor(private readonly llmProviderService: LlmProviderService) {}

  @Post('')
  async createProvider(
    @Body() dto: CreateProviderDto,
  ): Promise<ControllerResponse<{ provider: ProviderDto }>> {
    const provider = await this.llmProviderService.createProvider(dto);
    const providerDto = ProviderMapper.toDto(provider);
    return Promise.resolve({
      message: 'Provider created successfully',
      data: { provider: providerDto },
    });
  }
}

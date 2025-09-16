import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelDto } from './dto/model.dto';
import { ModelMapper } from './mapper/model.mapper';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';
import { ProviderDto } from './dto/provider.dto';
import { ProviderMapper } from './mapper/provider.mapper';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('provider')
  async createProvider(
    @Body() dto: CreateProviderDto,
  ): Promise<ControllerResponse<{ provider: ProviderDto }>> {
    const provider = await this.aiService.createProvider(dto.name, dto.apiKey);
    const providerDto = ProviderMapper.toDto(provider);
    return Promise.resolve({
      message: 'Provider created successfully',
      data: { provider: providerDto },
    });
  }

  @Patch('provider/:id')
  async toggleProvider(
    @Param('id') id: number,
    @Body() dto: UpdateProviderDto,
  ): Promise<ControllerResponse<{ provider: ProviderDto }>> {
    const provider = await this.aiService.toggleProvider(
      Number(id),
      dto.isActive,
    );
    const providerDto = ProviderMapper.toDto(provider);
    return Promise.resolve({
      message: 'Provider updated successfully',
      data: { provider: providerDto },
    });
  }

  @Patch('model/:id')
  async toggleModel(
    @Param('id') id: number,
    @Body() dto: UpdateModelDto,
  ): Promise<ControllerResponse<{ model: ModelDto }>> {
    const model = await this.aiService.toggleModel(Number(id), dto.isActive);
    const modelDto = ModelMapper.toDto(model);
    return Promise.resolve({
      message: 'Model updated successfully',
      data: { model: modelDto },
    });
  }

  @Get('models')
  async listModels(): Promise<ControllerResponse<{ models: ModelDto[] }>> {
    const models = await this.aiService.listModels();
    const modelDtos: ModelDto[] = models.map((model) =>
      ModelMapper.toDto(model),
    );
    return Promise.resolve({
      data: { models: modelDtos },
      message: 'Models retrieved successfully',
    });
  }
  @Get('providers')
  async listProviders(): Promise<
    ControllerResponse<{ providers: ProviderDto[] }>
  > {
    const providers = this.aiService.listProviders();
    const providerDtos: ProviderDto[] = (await providers).map((provider) =>
      ProviderMapper.toDto(provider),
    );
    return Promise.resolve({
      data: { providers: providerDtos },
      message: 'Providers retrieved successfully',
    });
  }

  @Get('models/active')
  async listActiveModels(): Promise<
    ControllerResponse<{ models: ModelDto[] }>
  > {
    const models = await this.aiService.listActiveModels();

    const modelDtos: ModelDto[] = models.map((model) =>
      ModelMapper.toDto(model),
    );

    return Promise.resolve({
      data: { models: modelDtos },
      message: 'Active models retrieved successfully',
    });
  }

  @Get('providers/active')
  async listActiveProviders(): Promise<
    ControllerResponse<{ providers: ProviderDto[] }>
  > {
    const providers = await this.aiService.listActiveProviders();
    const providerDtos: ProviderDto[] = providers.map((provider) =>
      ProviderMapper.toDto(provider),
    );
    return Promise.resolve({
      data: { providers: providerDtos },
      message: 'Active providers retrieved successfully',
    });
  }
}

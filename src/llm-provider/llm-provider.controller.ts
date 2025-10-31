import {
  Body,
  Controller,
  Post,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateLlmProviderDto } from './dto/update-provider.dto';
import { LlmProviderService } from './llm-provider.service';
import { ProviderMapper } from 'src/ai/mapper/provider.mapper';
import { ProviderDto } from 'src/ai/dto/provider.dto';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';

@ApiTags('LLM Providers')
@Controller('llm-provider')
export class LlmProviderController {
  constructor(private readonly llmProviderService: LlmProviderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all LLM providers' })
  async listProviders(): Promise<
    ControllerResponse<{ providers: ProviderDto[] }>
  > {
    const providers = await this.llmProviderService.listProviders();
    const providerDtos = providers.map((provider) =>
      ProviderMapper.toDto(provider),
    );
    return {
      data: { providers: providerDtos },
      message: 'Providers fetched successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new LLM provider' })
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update a LLM provider' })
  @ApiParam({ name: 'id', type: Number, description: 'Provider ID' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  @ApiBody({ type: UpdateLlmProviderDto })
  async updateProvider(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLlmProviderDto,
  ): Promise<ControllerResponse<{ provider: ProviderDto }>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const provider = await this.llmProviderService.updateProvider(id, dto);
    const providerDto = ProviderMapper.toDto(provider);
    return {
      data: { provider: providerDto },
      message: 'Provider updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a LLM provider' })
  @ApiParam({ name: 'id', type: Number, description: 'Provider ID' })
  async deleteProvider(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ControllerResponse<null>> {
    await this.llmProviderService.deleteProvider(id);
    return {
      data: null,
      message: 'Provider deleted successfully',
    };
  }
}

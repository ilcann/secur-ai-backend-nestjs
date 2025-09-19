import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { LlmModelService } from './llm-model.service';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';
import { AiModel } from '@prisma/client';

@ApiTags('Llm Models')
@Controller('llm-models')
export class LlmModelController {
  constructor(private readonly service: LlmModelService) {}

  @Get()
  @ApiOperation({ summary: 'Get all LLM models' })
  async listModels(): Promise<ControllerResponse<{ models: AiModel[] }>> {
    const models = await this.service.listModels();
    return {
      data: { models },
      message: 'LLM models fetched successfully',
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active LLM models' })
  async listActiveModels(): Promise<ControllerResponse<{ models: AiModel[] }>> {
    const models = await this.service.listActiveModels();
    return {
      data: { models },
      message: 'Active LLM models fetched successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a LLM model by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Model ID' })
  @ApiBody({ type: UpdateAiModelDto })
  async updateModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAiModelDto,
  ): Promise<ControllerResponse<{ model: AiModel }>> {
    const model = await this.service.updateModel(id, dto);
    return {
      data: { model },
      message: 'LLM model updated successfully',
    };
  }
}

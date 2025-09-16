import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateProviderDto } from './dto/create-provider';
import { UpdateProviderDto } from './dto/update-provider';
import { UpdateModelDto } from './dto/update-model';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('provider')
  createProvider(@Body() dto: CreateProviderDto) {
    return this.aiService.createProvider(dto.name, dto.apiKey);
  }

  @Patch('provider/:id')
  toggleProvider(@Param('id') id: number, @Body() dto: UpdateProviderDto) {
    return this.aiService.toggleProvider(Number(id), dto.isActive);
  }

  @Patch('model/:id')
  toggleModel(@Param('id') id: number, @Body() dto: UpdateModelDto) {
    return this.aiService.toggleModel(Number(id), dto.isActive);
  }

  @Get('models/active')
  listActiveModels() {
    return this.aiService.listActiveModels();
  }

  @Get('providers/active')
  listActiveProviders() {
    return this.aiService.listActiveProviders();
  }
}

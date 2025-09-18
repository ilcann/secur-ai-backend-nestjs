import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { EntityLabel, Prisma } from '@prisma/client';
import { CreateLabelDto } from './dto/create-label.dto';
import { lastValueFrom } from 'rxjs';
import { SyncResponseDto } from './dto/sync-response';

const fastApiHost = process.env.FASTAPI_HOST || 'localhost';
const fastApiPort = process.env.FASTAPI_PORT || '3003';

@Injectable()
export class LabelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async findOne(
    where: Prisma.EntityLabelWhereUniqueInput,
  ): Promise<EntityLabel | null> {
    return await this.prisma.entityLabel.findUnique({ where });
  }

  async getLabels(): Promise<EntityLabel[]> {
    return await this.prisma.entityLabel.findMany();
  }

  async createLabel(dto: CreateLabelDto): Promise<EntityLabel> {
    return await this.prisma.entityLabel.create({
      data: {
        name: dto.name,
        key: dto.key,
        description: dto.description,
      },
    });
  }
  async syncLabels() {
    try {
      const response = await lastValueFrom(
        this.httpService.post<SyncResponseDto>(
          `http://${fastApiHost}:${fastApiPort}/fastapi/ner/labels/sync`,
        ),
      );
      return response.data;
    } catch (error: any) {
      console.error('Error syncing labels: ', error);
      throw new InternalServerErrorException('Failed to sync labels: ' + error);
    }
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { NerEntityDto } from './dto/ner-entity.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityDto } from './dto/entity.dto';
import { MessageService } from 'src/message/message.service';

const fastApiHost = process.env.FASTAPI_HOST || 'localhost';
const fastApiPort = process.env.FASTAPI_PORT || '3003';
const fastApiUrl = `http://${fastApiHost}:${fastApiPort}`;

@Injectable()
export class EntityService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly messageService: MessageService,
  ) {}

  async detectEntities(messageId: number): Promise<EntityDto[]> {
    const message = await this.messageService.getOne(messageId);

    const response = await lastValueFrom(
      this.httpService.post<{ entities: NerEntityDto[] }>(
        `${fastApiUrl}/fastapi/ner/extract`,
        {
          text: message.content,
        },
      ),
    );

    const rawEntities = response.data.entities;
    const rawResponseLabels = response.data.entities.map((e) => e.label);
    const responseLabels = await this.prisma.entityLabel.findMany({
      where: { key: { in: rawResponseLabels } },
    });

    const entities = rawEntities.map((nerEntity) => {
      const entityLabel = responseLabels.find(
        (l) => l.key === nerEntity.label,
      )!;
      return {
        messageId,
        entityLabelId: entityLabel.id,
        value: nerEntity.text,
        start: nerEntity.start,
        end: nerEntity.end,
        maskedValue: `[${entityLabel.name}]`,
      };
    });

    await this.prisma.messageEntity.createMany({
      data: entities.map((e) => ({
        messageId: messageId,
        entityLabelId: e.entityLabelId,
        value: e.value,
        start: e.start,
        end: e.end,
        maskedValue: e.maskedValue,
      })),
    });

    return entities;
  }
}

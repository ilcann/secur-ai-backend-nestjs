import { Injectable } from '@nestjs/common';
import { MaskAction } from '@prisma/client';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MaskService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
  ) {}
  async setEntityMaskFlags(messageId: number) {
    const message = await this.messageService.getOneWithEntities(messageId);
    const { entities, senderId } = message;

    const policies = await this.prisma.maskPolicy.findMany({
      where: {
        OR: [{ userId: senderId }],
        entityLabelId: { in: entities.map((e) => e.entityLabelId) },
      },
    });
    await Promise.all(
      entities.map((entity) => {
        const policy = policies.find(
          (p) =>
            p.entityLabelId === entity.entityLabelId && p.userId === senderId,
        );
        if (!policy) return;

        return this.prisma.messageEntity.update({
          where: { id: entity.id },
          data: { isMasked: policy.isMasked },
        });
      }),
    );
  }

  async applyMask(messageId: number): Promise<string> {
    const message = await this.messageService.getOneWithEntities(messageId);
    const { content, entities } = message;

    // Work on the string directly using slice to keep indices consistent
    // Sort descending by start so earlier replacements don't shift later indices
    const sortedEntities = [...entities].sort(
      (a, b) => (b.start ?? 0) - (a.start ?? 0),
    );

    let maskedContent = content;

    for (const entity of sortedEntities) {
      if (
        entity.isMasked === MaskAction.MASK &&
        entity.start != null &&
        entity.end != null
      ) {
        const start = Math.max(0, Math.min(entity.start, maskedContent.length));
        const end = Math.max(start, Math.min(entity.end, maskedContent.length));
        if (start >= end) continue;

        const replacement = entity.maskedValue || '[Masked]';
        maskedContent =
          maskedContent.slice(0, start) +
          replacement +
          maskedContent.slice(end);
      }
    }

    return maskedContent;
  }
}

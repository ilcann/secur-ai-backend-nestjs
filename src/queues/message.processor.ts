import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Message } from '@prisma/client';
import { Job } from 'bullmq';
import { EntityService } from 'src/entity/entity.service';
import { MessageService } from 'src/message/message.service';

@Processor('messages')
export class MessageProcessor extends WorkerHost {
  constructor(
    private messageService: MessageService,
    private entityService: EntityService,
  ) {
    super();
  }
  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'user_draft.created': {
        const { message } = job.data as { message: Message };
        const entities = await this.entityService.detectEntities(
          message.id,
          message.content,
        );
        await this.messageService.updateMessageEntities(message.id, entities);
        break;
      }
      case 'message.entities.updated':
        // TODO: implement actual processing logic
        console.log('Processing message entities updated job:', job.data);
        break;
      case 'message.masked.updated':
        // TODO: implement actual processing logic
        console.log('Processing message masked updated job:', job.data);
        break;
      case 'llm.draft.created':
        // TODO: implement actual processing logic
        console.log('Processing LLM draft created job:', job.data);
        break;
    }
  }
  onCompleted(job: Job) {
    console.log('Job completed:', job);
  }
  onFailed(job: Job, err: Error) {
    console.error('Job failed:', job, err);
  }
}

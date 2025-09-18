import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('messages')
export class MessageProcessor extends WorkerHost {
  process(job: Job): any {
    switch (job.name) {
      case 'user_draft.created':
        // TODO: implement actual processing logic
        console.log('Processing user draft created job:', job.data);
        break;
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
}

import { Module } from '@nestjs/common';
import { EntityService } from './entity.service';
import { HttpModule } from '@nestjs/axios';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [HttpModule, MessageModule],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {}

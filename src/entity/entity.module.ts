import { Module } from '@nestjs/common';
import { EntityService } from './entity.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {}

import { Module } from '@nestjs/common';
import { MaskService } from './mask.service';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [MessageModule],
  providers: [MaskService],
  exports: [MaskService],
})
export class MaskModule {}

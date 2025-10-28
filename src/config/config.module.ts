import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from './jwt.config';
import { appConfig } from './app.config';
import { bullConfig } from './bull.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, appConfig, bullConfig],
    }),
  ],
})
export class AppConfigModule {}

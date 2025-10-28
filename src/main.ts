import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app.config';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfiguration = configService.get<AppConfig>('app')!;

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const frontend = `http://${process.env.NEXTJS_HOST}:${process.env.NEXTJS_PORT}`;
  const fastapi = `http://${process.env.FASTAPI_HOST}:${process.env.FASTAPI_PORT}`;
  const allowedOrigins = [frontend, fastapi];

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  app.use(cookieParser());

  if (appConfiguration.swaggerEnabled) {
    const options = new DocumentBuilder()
      .setTitle(appConfiguration.swaggerTitle)
      .setDescription(appConfiguration.swaggerDescription)
      .setVersion(appConfiguration.swaggerVersion)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        appConfiguration.swaggerBearerName,
      )
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(appConfiguration.swaggerPath, app, document);
  }

  await app.listen(appConfiguration.port, '0.0.0.0');
}
void bootstrap();

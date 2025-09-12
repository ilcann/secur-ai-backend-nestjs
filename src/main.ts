import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const frontend = `http://${process.env.NEXTJS_HOST}:${process.env.NEXTJS_PORT}`;
  const fastapi = `http://${process.env.FASTAPI_HOST}:${process.env.FASTAPI_PORT}`;
  const allowedOrigins = [frontend, fastapi];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Secur Ai API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://${process.env.NESTJS_HOST}:${process.env.NESTJS_PORT}`)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.NESTJS_PORT ?? 3002);
}
void bootstrap();

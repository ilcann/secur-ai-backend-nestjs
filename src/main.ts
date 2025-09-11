import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    `http://${process.env.FASTAPI_HOST}:${process.env.FASTAPI_PORT}`,
    `http://${process.env.VITE_WEB_HOST}:${process.env.VITE_WEB_PORT}`,
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

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

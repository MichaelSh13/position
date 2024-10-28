import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { DEFAULT_PORT } from './app.const';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get<number>('common.port') || DEFAULT_PORT;
  const API_LIMIT = configService.get<string>('common.api_limit') || '5mb';

  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(json({ limit: API_LIMIT }));
  app.use(urlencoded({ extended: true, limit: API_LIMIT }));

  app.use(helmet());
  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('TradingBot API.')
    .setDescription('Description for API.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Token.',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);

  console.log(`PORT: ${PORT};`);
}
bootstrap();

// TODO: cache - skillcombo/backend

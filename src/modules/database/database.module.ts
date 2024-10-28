import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const db =
          configService.getOrThrow<MongooseModuleFactoryOptions>('database');

        return db;
      },
    }),
  ],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { EmployerController } from './controllers/employer.controller';
import { employerPermissions } from './employer.permission';
import { EmployerEntity } from './entities/employer.entity';
import { EmployerService } from './services/employer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployerEntity]),
    CaslModule.forFeature({ permissions: employerPermissions }),
  ],
  controllers: [EmployerController],
  providers: [EmployerService],
  exports: [EmployerService],
})
export class EmployerModule {}

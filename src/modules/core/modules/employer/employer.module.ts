import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { AccountModule } from '../account/account.module';
import { EmployerController } from './controllers/employer.controller';
import { employerPermissions } from './employer.permission';
import { EmployerEntity } from './entities/employer.entity';
import { EmployerInfoEntity } from './entities/employer-info.entity';
import { EmployerHandlerService } from './handlers/employer.handler.service';
import { EmployerJobService } from './jobs/employer.job.service';
import { EmployerService } from './services/employer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployerEntity, EmployerInfoEntity]),
    CaslModule.forFeature({ permissions: employerPermissions }),
    AccountModule,
  ],
  controllers: [EmployerController],
  providers: [EmployerService, EmployerHandlerService, EmployerJobService],
  exports: [EmployerService],
})
export class EmployerModule {}

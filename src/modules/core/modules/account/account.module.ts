import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'nest-casl';

import { accountPermissions } from './account.permission';
import { AccountController } from './controllers/account.controller';
import { AccountEntity } from './entities/account.entity';
import { AccountInfoEntity } from './entities/account-info.entity';
import { AccountHandlerService } from './handlers/account.handler.service';
import { AccountJobService } from './jobs/account.job.service';
import { AccountService } from './services/account.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, AccountInfoEntity]),
    CaslModule.forFeature({ permissions: accountPermissions }),
  ],
  controllers: [AccountController],
  providers: [AccountService, AccountHandlerService, AccountJobService],
  exports: [AccountService],
})
export class AccountModule {}

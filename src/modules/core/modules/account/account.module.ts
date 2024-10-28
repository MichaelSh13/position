import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountController } from './controllers/account.controller';
import { AccountEntity } from './entities/account.entity';
import { AccountHandlerService } from './handlers/account.handler';
import { AccountService } from './services/account.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity])],
  controllers: [AccountController],
  providers: [AccountService, AccountHandlerService],
  exports: [AccountService],
})
export class AccountModule {}

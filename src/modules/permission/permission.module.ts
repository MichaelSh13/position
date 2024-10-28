import { Module } from '@nestjs/common';
import { CaslModule } from 'nest-casl';

import { AccountRoles } from './consts/permission.const';

@Module({
  imports: [CaslModule.forRoot<AccountRoles>({})],
})
export class PermissionModule {}

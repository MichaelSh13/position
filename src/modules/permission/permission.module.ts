import { Module } from '@nestjs/common';
import { CaslModule } from 'nest-casl';

import { UserRoles } from './permission.type.dt';

@Module({
  imports: [CaslModule.forRoot<UserRoles>({})],
})
export class PermissionModule {}

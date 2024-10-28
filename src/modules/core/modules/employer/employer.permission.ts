import type { Permissions } from 'nest-casl';
import { Actions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { EmployerEntity } from './entities/employer.entity';
import { AccountEntity } from '../account/entities/account.entity';

export const employerPermissions: Permissions<
  AccountRoles,
  EmployerEntity,
  Actions,
  AccountEntity
> = {
  CLIENT({ can, user }) {
    if (!AccountEntity.isVerified(user)) {
      return;
    }

    can(Actions.create, EmployerEntity);
  },
  ADMIN({ can }) {
    can(Actions.manage, EmployerEntity);
  },
};

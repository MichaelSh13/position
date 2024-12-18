import type { Permissions } from 'nest-casl';
import { Actions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { AccountEntity } from '../account/entities/account.entity';
import { EmployerEntity } from './entities/employer.entity';

export const employerPermissions: Permissions<
  AccountRoles,
  EmployerEntity,
  Actions,
  AccountEntity
> = {
  CLIENT({ can, user }) {
    if (!AccountEntity.isActive(user)) {
      return;
    }

    can(Actions.create, EmployerEntity);
  },
  EMPLOYER({ can, user }) {
    // if (user.employer?.isBlocked) {
    //   return;
    // }

    // TODO!: Deal with permissions.
    can(Actions.update, EmployerEntity);
  },
  ADMIN({ can }) {
    can(Actions.manage, EmployerEntity);
  },
};

import type { Permissions } from 'nest-casl';
import { Actions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { AccountEntity } from '../account/entities/account.entity';

export const accountPermissions: Permissions<
  AccountRoles,
  AccountEntity,
  Actions,
  AccountEntity
> = {
  CLIENT({ can, user }) {
    if (!AccountEntity.isActive(user, { verification: false })) {
      return;
    }

    can(Actions.read, AccountEntity);
    can(Actions.update, AccountEntity);
  },
  ADMIN({ can }) {
    can(Actions.manage, AccountEntity);
  },
};

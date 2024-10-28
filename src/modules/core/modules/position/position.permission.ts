import type { Permissions } from 'nest-casl';
import { Actions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { PositionEntity } from './entities/position.entity';
import type { AccountEntity } from '../account/entities/account.entity';
import { EmployerEntity } from '../employer/entities/employer.entity';

export const positionPermissions: Permissions<
  AccountRoles,
  PositionEntity,
  Actions,
  AccountEntity
> = {
  everyone({ can }) {
    can(Actions.read, PositionEntity);
  },
  EMPLOYER({ can, user }) {
    if (!EmployerEntity.isVerified(user.employer, user)) {
      return;
    }
    // TODO: Ban/Black list check during validation tokens refresh and login.
    can(Actions.create, PositionEntity);
    can(Actions.update, PositionEntity);
    can(Actions.manage, PositionEntity);
    can(Actions.delete, PositionEntity);
  },
};
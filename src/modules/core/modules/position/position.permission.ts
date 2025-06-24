import type { Permissions } from 'nest-casl';
import { Actions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { EmployerEntity } from '../employer/entities/employer.entity';
import { PositionEntity } from './entities/position.entity';

export const positionPermissions: Permissions<
  AccountRoles,
  PositionEntity,
  Actions,
  AccountEntityWithEmployer
> = {
  everyone({ can }) {
    can(Actions.read, PositionEntity);
  },
  EMPLOYER({ can, user }) {
    if (!EmployerEntity.isActive(user.employer, { verification: false }))
      return;

    can(Actions.create, PositionEntity);

    if (!EmployerEntity.isActive(user.employer)) return;

    can(Actions.update, PositionEntity);
    can(Actions.delete, PositionEntity);
  },
  ADMIN({ can }) {
    can(Actions.manage, PositionEntity);
  },
};

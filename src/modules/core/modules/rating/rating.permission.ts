import type { Permissions } from 'nest-casl';
import { Actions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { AccountEntity } from '../account/entities/account.entity';
import { RatingEntity } from './entities/rating.entity';

export const ratingPermissions: Permissions<
  AccountRoles,
  RatingEntity,
  Actions,
  AccountEntity
> = {
  everyone({ can }) {
    can(Actions.read, RatingEntity);
  },
  CLIENT({ can, user }) {
    if (!AccountEntity.isActive(user)) return;

    can(Actions.update, RatingEntity);
    can(Actions.create, RatingEntity);
  },
};

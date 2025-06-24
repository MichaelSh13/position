import type { Permissions } from 'nest-casl';
import { Actions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import type { AccountEntity } from '../account/entities/account.entity';
import { EmployerEntity } from '../employer/entities/employer.entity';
import { ConversationEntity } from './entities/conversation.entity';

export const conversationPermissions: Permissions<
  AccountRoles,
  ConversationEntity,
  Actions,
  AccountEntity
> = {
  EMPLOYER({ can, user }) {
    if (EmployerEntity.isActive(user.employer)) {
      return;
    }

    can(Actions.create, ConversationEntity);
  },
};

import type { Actions, Permissions } from 'nest-casl';
import { DefaultActions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { AccountEntity } from '../core/modules/account/entities/account.entity';

export enum AuthSpecifyActions {
  SEND_VERIFICATION_EMAIL = 'send-verification-email',
}

export type AuthActions = DefaultActions | AuthSpecifyActions;
export const AuthActions = {
  ...DefaultActions,
  ...AuthSpecifyActions,
};

export const authPermissions: Permissions<
  AccountRoles,
  AccountEntity,
  Actions,
  AccountEntity
> = {
  CLIENT({ can, user }) {
    // if (user.isBlocked) {
    //   return;
    // }

    can(AuthActions.SEND_VERIFICATION_EMAIL, AccountEntity);
  },
};

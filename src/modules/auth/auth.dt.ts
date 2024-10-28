import type { Request } from 'express';

import type { UserEntity } from '../core/modules/user/models/user.model';

declare global {
  type PayloadUser = UserEntity & {
    iat: number;
    exp: number;
  };

  type CustomRequest = Request & {
    user?: UserEntity;
  };
}

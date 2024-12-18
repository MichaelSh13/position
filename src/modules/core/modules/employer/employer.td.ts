import type { Repository } from 'typeorm';

import type { AccountEntity } from '../account/entities/account.entity';

export {};

declare global {
  type AccountFindOne = Repository<AccountEntity>['findOne'];
  type AccountRelations = Parameters<AccountFindOne>[0]['relations'];

  type EmployerIsActiveOptions = {
    verification?: boolean;
    error?: boolean;
    activated?: boolean;
    parent?: boolean;
  };
}

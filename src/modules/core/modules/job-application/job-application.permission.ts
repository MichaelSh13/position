import type { Permissions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import { AccountEntity } from '../account/entities/account.entity';
import { EmployerEntity } from '../employer/entities/employer.entity';
import { JobApplicationEntity } from './entities/job-application.entity';

export enum JobApplicationActions {
  READ = 'read',
  CREATE = 'create',
  CLIENT_READ = 'client-read',
  CLIENT_MANAGE = 'client-manage',
  EMPLOYER_READ = 'employer-read',
  EMPLOYER_MANAGE = 'employer-manage',
  MANAGE = 'manage',
}

export const jobApplicationPermissions: Permissions<
  AccountRoles,
  JobApplicationEntity,
  JobApplicationActions,
  AccountEntity
> = {
  CLIENT({ can, user }) {
    can(JobApplicationActions.READ, JobApplicationEntity);
    can(JobApplicationActions.CLIENT_READ, JobApplicationEntity);

    if (!AccountEntity.isActive(user)) return;

    can(JobApplicationActions.CREATE, JobApplicationEntity);
    can(JobApplicationActions.CLIENT_MANAGE, JobApplicationEntity);
  },
  EMPLOYER({ can, user }) {
    can(JobApplicationActions.READ, JobApplicationEntity);
    can(JobApplicationActions.EMPLOYER_READ, JobApplicationEntity);

    if (!EmployerEntity.isActive(user.employer)) return;

    can(JobApplicationActions.EMPLOYER_MANAGE, JobApplicationEntity);
  },
  ADMIN({ can }) {
    can(JobApplicationActions.MANAGE, JobApplicationEntity);
  },
};

import type { Permissions } from 'nest-casl';
import type { AccountRoles } from 'src/modules/permission/consts/permission.const';

import type { AccountEntity } from '../account/entities/account.entity';
import { JobApplicationEntity } from './entities/job-application.entity';

export enum JobApplicationActions {
  READ = 'read',
  CREATE = 'create',
  CLIENT_READ = 'client-read',
  CLIENT_MANAGE = 'client-manage',
  EMPLOYER_READ = 'employer-read',
  EMPLOYER_MANAGE = 'employer-manage',
}

export const jobApplicationPermissions: Permissions<
  AccountRoles,
  JobApplicationEntity,
  JobApplicationActions,
  AccountEntity
> = {
  CLIENT({ can, user }) {
    // if (!AccountEntity.isVerified(user)) {
    //   return;
    // }

    can(JobApplicationActions.READ, JobApplicationEntity);
    can(JobApplicationActions.CLIENT_READ, JobApplicationEntity);
    can(JobApplicationActions.CREATE, JobApplicationEntity);
    can(JobApplicationActions.CLIENT_MANAGE, JobApplicationEntity);
  },
  EMPLOYER({ can, user }) {
    // TODO!: put right permissions.
    // if (!EmployerEntity.isVerified(user.employer, user)) {
    //   return;
    // }

    can(JobApplicationActions.READ, JobApplicationEntity);
    can(JobApplicationActions.EMPLOYER_READ, JobApplicationEntity);
    can(JobApplicationActions.EMPLOYER_MANAGE, JobApplicationEntity);
  },
};

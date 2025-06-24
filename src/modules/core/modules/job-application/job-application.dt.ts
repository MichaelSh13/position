import type { JobApplicationEntity } from './entities/job-application.entity';

export {};

declare global {
  type JobApplicationIsActiveOption = {
    error?: boolean;
    parent?: boolean;
    account?: boolean;
    user?: boolean;
    client?: boolean;
  };
  type BulkJobApplicationUpdateData = {
    id: string;
    isParentActive: boolean;
  };

  type BulkJobApplicationUpdateOptions = {
    idField: string;
    parentField: keyof Pick<
      JobApplicationEntity,
      'isAccountActive' | 'isPositionActive'
    >;
  };
}

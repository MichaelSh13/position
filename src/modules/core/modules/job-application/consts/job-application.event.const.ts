export enum JobApplicationEvents {
  CREATED = 'job-application.created',
  UPDATED = 'job-application.updated',

  UPDATED_USER_STATUS = 'job-application.user.client-status',
  UPDATED_CLIENT_STATUS = 'job-application.updated.client-status',
  UPDATED_SYSTEM_STATUS = 'job-application.updated.system-status',

  UPDATED_ACTIVITY = 'position.updated-activity',
  BULK_UPDATED_ACTIVITY = 'position.updated-activity.bulk',
}

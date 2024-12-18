export enum JobApplicationStatus {
  // * The application has been successfully submitted by the candidate.
  SUBMITTED = 'submitted',
  // * The application is being reviewed by the hiring team.
  UNDER_REVIEW = 'under-review',
  // * The candidate has passed initial screening and is shortlisted for further evaluation.
  SHORTLISTED = 'shortlisted',
  // * The candidate is scheduled for or actively participating in interviews.
  INTERVIEWING = 'interviewing',
  // * The candidate is undergoing an additional evaluation, such as a skills test or assessment.
  ASSESSMENT = 'assessment',
  // * A job offer has been extended to the candidate.
  OFFER_EXTENDED = 'offer-extended',
  // * The candidate has accepted the job offer.
  ACCEPTED = 'accepted',
  // * The candidate did not meet the requirements or was declined for this position.
  REJECTED = 'rejected',
  // * The candidate has voluntarily withdrawn their application.
  WITHDRAWN = 'withdrawn',

  // TODO: Implement cron-job for this functionality.
  EXPIRED = 'EXPIRED',
}
export const activeJobApplicationStatuses = [
  JobApplicationStatus.UNDER_REVIEW,
  JobApplicationStatus.SHORTLISTED,
  JobApplicationStatus.INTERVIEWING,
  JobApplicationStatus.ASSESSMENT,
  JobApplicationStatus.OFFER_EXTENDED,
];
export const closeJobApplicationStatuses = [
  JobApplicationStatus.ACCEPTED,
  JobApplicationStatus.REJECTED,
  JobApplicationStatus.WITHDRAWN,
  JobApplicationStatus.EXPIRED,
];

export enum JobApplicationClientsCommand {
  ACCEPT = 'accept',
  WITHDRAW = 'withdraw',
}

export enum JobApplicationEmployersCommand {
  REVIEW = 'review',
  SHORTLIST = 'shortlist',
  INTERVIEW = 'interview',
  EVALUATE = 'evaluate',
  OFFER_EXTEND = 'offer-extend',
  REJECT = 'reject',
}

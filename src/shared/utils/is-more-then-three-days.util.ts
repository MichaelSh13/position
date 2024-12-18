import { MS_IN_DAY } from '../consts/time.const';

export const isMoreThanThreeDays = (
  date1: Date,
  date2: Date = new Date(),
  diffInDays: number = 3,
): boolean => {
  const differenceInMs = Math.abs(date1.getTime() - date2.getTime());

  return differenceInMs / MS_IN_DAY > diffInDays;
};

import { format } from 'date-fns';

export const formatTopicDate = (date: Date): string => {
  return String(format(date, 'LLL dd, yyyy, HH:mm'));
};

export const formatDate = date =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const calculateDuration = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatPrice = (val, currency = '$') => {
  if (val === undefined || val === null) return `${currency}0.00`;
  return `${currency}${parseFloat(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0];
};

export const formatRupiah = (amount, withPrefix = false) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  const num = Math.round(Number(amount));
  const isNegative = num < 0;
  const absFormatted = Math.abs(num).toLocaleString('id-ID');
  
  if (withPrefix) {
    return isNegative ? `-Rp${absFormatted}` : `Rp${absFormatted}`;
  }
  return isNegative ? `-${absFormatted}` : absFormatted;
};

export const parseNumber = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().replace(/[^0-9-]/g, '');
  return parseInt(cleaned, 10) || 0;
};

export const ROMAN_MONTHS = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

export const toRomanMonth = (monthIndex) => {
  // monthIndex 0-11 or 1-12
  const idx = typeof monthIndex === 'number' && monthIndex >= 1 && monthIndex <= 12
    ? monthIndex - 1
    : monthIndex;
  return ROMAN_MONTHS[idx] || 'I';
};

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const formatDateIndo = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  const day = d.getDate();
  const month = MONTH_NAMES_ID[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const getTwoDigitYear = (dateInput) => {
  if (!dateInput) return new Date().getFullYear().toString().slice(-2);
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date().getFullYear().toString().slice(-2);
  return d.getFullYear().toString().slice(-2);
};

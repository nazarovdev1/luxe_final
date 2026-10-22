// Uzbek date labels that do not depend on the browser's locale data.
// Some browsers (Android WebView, Electron) ship without Uzbek month names and
// print "2026 M10 3" for toLocaleDateString('uz-UZ'), so the names live here.

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const MONTHS_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
const WEEKDAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

const toDate = (value) => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pad = (number) => String(number).padStart(2, '0');

// "3-oktabr, 2026" · { year: false } → "3-oktabr" · { short: true } → "3-okt"
// · { time: true } appends ", 14:05".
export const formatUzDate = (value, { year = true, short = false, time = false } = {}) => {
  const date = toDate(value);
  if (!date) return '';
  const month = (short ? MONTHS_SHORT : MONTHS)[date.getMonth()];
  let label = `${date.getDate()}-${month}`;
  if (year) label += `, ${date.getFullYear()}`;
  if (time) label += `, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return label;
};

export const formatUzWeekday = (value) => {
  const date = toDate(value);
  return date ? WEEKDAYS_SHORT[date.getDay()] : '';
};

export const formatUzMonthShort = (value) => {
  const date = toDate(value);
  return date ? MONTHS_SHORT[date.getMonth()] : '';
};

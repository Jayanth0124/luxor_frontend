import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

// "22 Mar 2026"
export const fmtDate = (d) => d ? dayjs(d).format('DD MMM YYYY') : '—';

// "22 March 2026"
export const fmtDateLong = (d) => d ? dayjs(d).format('DD MMMM YYYY') : '—';

// "22 Mar 2026, 10:30 AM"
export const fmtDatetime = (d) => d ? dayjs(d).format('DD MMM YYYY, hh:mm A') : '—';

// "10:30 AM"
export const fmtTime = (d) => d ? dayjs(d).format('hh:mm A') : '—';

// "2h ago" / "3 days ago"
export const fromNow = (d) => d ? dayjs(d).fromNow() : '—';

// YYYY-MM-DD string for <input type="date"> min/value
export const todayStr = () => dayjs().format('YYYY-MM-DD');

// YYYY-MM-DDTHH:mm string for <input type="datetime-local"> min/value
export const nowLocalStr = () => dayjs().format('YYYY-MM-DDTHH:mm');

// Days between two date strings/objects (rounded)
export const diffDays = (start, end) =>
  start && end ? Math.max(0, Math.round(dayjs(end).diff(dayjs(start), 'hour') / 24)) : 0;

// Hours between two datetime strings/objects (rounded)
export const diffHours = (start, end) =>
  start && end ? Math.max(0, Math.round(dayjs(end).diff(dayjs(start), 'minute') / 60)) : 0;

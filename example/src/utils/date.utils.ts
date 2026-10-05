const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string, options: Intl.DateTimeFormatOptions) {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone });
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatInTimeZone(
  date: Date,
  timeZone: string | null | undefined,
  options: Intl.DateTimeFormatOptions
) {
  try {
    return formatterFor(timeZone ?? 'UTC', options).format(date);
  } catch {
    return formatterFor('UTC', options).format(date);
  }
}

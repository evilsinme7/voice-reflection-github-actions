function partsAt(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

export function captureTime(date = new Date(), timezone = "Asia/Shanghai") {
  const p = partsAt(date, timezone);
  const hour = Number(p.hour);
  const period = hour < 11 ? "早" : hour < 17 ? "午" : "晚";
  const localDateTime = `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
  const offsetName = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  const offset = offsetName?.replace("GMT", "") || "+00:00";
  return { period, iso: `${localDateTime}${offset}`, date: `${p.year}-${p.month}-${p.day}` };
}

export function weeklyWindow(date = new Date(), timezone = "Asia/Shanghai") {
  const end = captureTime(date, timezone);
  const startInstant = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  const displayStartInstant = new Date(date.getTime() - 6 * 24 * 60 * 60 * 1000);
  const start = captureTime(startInstant, timezone);
  const displayStart = captureTime(displayStartInstant, timezone);
  const [sm, sd] = displayStart.date.split("-").slice(1).map(Number);
  const [em, ed] = end.date.split("-").slice(1).map(Number);
  return {
    startDate: start.date,
    generatedDate: end.date,
    dateRange: `${sm}/${sd}-${em}/${ed}`,
  };
}

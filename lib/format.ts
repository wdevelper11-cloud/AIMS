const utcDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatUtcTimestamp(timestamp: string): string {
  return `${utcDateTimeFormatter.format(new Date(timestamp))} UTC`;
}

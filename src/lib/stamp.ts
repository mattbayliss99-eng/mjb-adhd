/** Shown when a stored time cannot be formatted. Never throws. */
export function formatStamp(ms: number): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "Date unavailable";
  try {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(ms);
    if (!formatted || formatted === "Invalid Date") return "Date unavailable";
    return formatted;
  } catch {
    return "Date unavailable";
  }
}

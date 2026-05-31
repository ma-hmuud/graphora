export function formatDate(value?: string | number | null) {
  if (value === null || value === undefined) return "-";

  let date: Date;

  if (typeof value === "number") {
    date = new Date(value);
  } else {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      date = new Date(trimmed.length <= 10 ? numeric * 1000 : numeric);
    } else {
      date = new Date(trimmed);
    }
  }

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

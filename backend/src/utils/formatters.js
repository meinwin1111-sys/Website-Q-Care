function formatDateOnly(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

function formatSlotTime(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const match = value.match(/(\d{2}:\d{2})/);
    return match ? match[1] : value.slice(0, 5);
  }
  if (value instanceof Date) {
    const h = String(value.getUTCHours()).padStart(2, "0");
    const m = String(value.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  return String(value);
}

function toNumber(value) {
  if (value == null) return 0;
  return Number(value);
}

module.exports = { formatDateOnly, formatSlotTime, toNumber };

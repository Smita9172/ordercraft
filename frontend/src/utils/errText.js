// Backend ke error (400) ko readable text mein badlo
export function errText(err) {
  const d = err.response?.data;
  if (!d) return "Server se connect nahi hua.";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.join(", ");
  if (d.detail) return d.detail;
  return Object.entries(d)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : JSON.stringify(v)}`)
    .join(" | ");
}
export function getErrorMessage(err, fallback = "Une erreur est survenue") {
  const detail = err.response?.data?.detail;

  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(" — ");
  }
  return fallback;
}
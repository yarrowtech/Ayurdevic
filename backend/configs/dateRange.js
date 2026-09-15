// Resolves a ?from=&to= query into a valid [from, to] Date range,
// defaulting to the last 30 days when either is missing or invalid.
export function parseRange(query = {}) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const from = query.from ? new Date(query.from) : defaultFrom;
  const to = query.to ? new Date(query.to) : now;
  if (isNaN(from) || isNaN(to) || from > to) return { from: defaultFrom, to: now };
  to.setHours(23, 59, 59, 999); // include the entire "to" day
  return { from, to };
}

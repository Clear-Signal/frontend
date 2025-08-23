export function initialsFromTitle(title) {
  if (!title) return "C";
  const parts = title.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
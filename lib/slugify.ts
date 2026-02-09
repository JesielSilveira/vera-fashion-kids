export function makeProductSlug(
  name: string,
  categorySlug?: string,
  shortId?: string
) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return [
    base,
    categorySlug,
    shortId?.slice(0, 4),
  ]
    .filter(Boolean)
    .join("-")
}
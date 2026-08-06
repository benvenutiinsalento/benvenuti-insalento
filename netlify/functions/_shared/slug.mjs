export function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function uniqueEventSlug(event) {
  const base = slugify(`${event.title}-${event.town}-${event.startDate}`);
  return base || `evento-${Date.now()}`;
}

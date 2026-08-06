// Dati di riserva verificati (archivio redazionale). Import statico: esbuild
// incorpora il JSON nel bundle (vedi registry.mjs). La rigenerazione
// giornaliera da database e' prevista nella fase delle GitHub Actions.
import verifiedProgramsData from '../../../data/verified-programs-2026.json' with { type: 'json' };
import { eventOccursInRange, eventSearchText, isFamilyFriendly, normalizeSearchText } from './events-core.mjs';
import { MUNICIPALITIES } from './registry.mjs';

export function loadVerifiedPrograms() {
  return verifiedProgramsData;
}

export function verifiedEvents() {
  const payload = loadVerifiedPrograms();
  return payload.programs.flatMap((program) => program.events.map((event, index) => ({
    id: `${program.key}-${index + 1}`,
    slug: `${program.key}-${index + 1}`,
    description: '',
    secondaryCategories: [],
    tags: [],
    occurrenceDates: [event.startDate],
    originalTimeText: event.startTime ? `ore ${event.startTime}` : '',
    town: program.municipality,
    locality: '',
    venue: program.municipality,
    address: '',
    latitude: program.latitude ?? null,
    longitude: program.longitude ?? null,
    priceText: 'Da verificare',
    priceType: 'unknown',
    audiences: [],
    organizer: program.entityName,
    artists: [],
    imageUrl: '',
    bookingUrl: '',
    status: 'published',
    verificationLevel: program.priority <= 1 ? 'primary' : program.priority <= 3 ? 'institutional' : 'official_social',
    sourceUrl: program.documentUrl || program.url,
    sourceName: program.entityName,
    lastCheckedAt: payload.capturedAt,
    updatedAt: payload.capturedAt,
    ...event,
  })));
}

export function isEveningEvent(event) {
  const time = String(event.startTime || event.originalTimeText || '').match(/(?:^|\D)(\d{1,2})(?::|[.,])?(\d{2})?/)?.slice(1);
  if (!time) return false;
  const minutes = Number(time[0]) * 60 + Number(time[1] || 0);
  return minutes >= 18 * 60;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const radians = (value) => value * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function listVerifiedEvents(filters = {}) {
  const from = filters.from || filters.date || '';
  const to = filters.to || from;
  const queryTokens = normalizeSearchText(filters.q || '').split(/\s+/).filter(Boolean);
  const selectedTown = MUNICIPALITIES.find((municipality) => municipality.slug === filters.town)?.name || filters.town || '';
  const hasCoordinates = filters.lat !== '' && filters.lat != null && filters.lng !== '' && filters.lng != null;
  const lat = hasCoordinates ? Number(filters.lat) : NaN;
  const lng = hasCoordinates ? Number(filters.lng) : NaN;
  const radius = Number(filters.radius);
  let events = verifiedEvents().filter((event) => {
    if (from && to && !eventOccursInRange(event, from, to)) return false;
    if (selectedTown && normalizeSearchText(event.town) !== normalizeSearchText(selectedTown)) return false;
    if (filters.category) {
      const categoryMatch = filters.category === 'Per famiglie'
        ? isFamilyFriendly(event)
        : event.primaryCategory === filters.category || event.secondaryCategories.includes(filters.category);
      if (!categoryMatch) return false;
    }
    if (filters.priceType && event.priceType !== filters.priceType) return false;
    if (filters.family && !isFamilyFriendly(event)) return false;
    if (filters.evening && !isEveningEvent(event)) return false;
    if (queryTokens.length && !queryTokens.every((token) => eventSearchText(event).includes(token))) return false;
    return true;
  }).map((event) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || event.latitude == null || event.longitude == null) return event;
    return { ...event, distanceKm: distanceKm(lat, lng, event.latitude, event.longitude) };
  });
  if (Number.isFinite(radius) && radius > 0) events = events.filter((event) => event.distanceKm != null && event.distanceKm <= radius);
  events.sort(filters.sort === 'distance' && Number.isFinite(lat) && Number.isFinite(lng)
    ? (left, right) => (left.distanceKm ?? Infinity) - (right.distanceKm ?? Infinity)
    : (left, right) => `${left.startDate} ${left.startTime || '99:99'} ${left.title}`.localeCompare(`${right.startDate} ${right.startTime || '99:99'} ${right.title}`));
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 30));
  const total = events.length;
  return { events: events.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
}

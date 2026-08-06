import fs from 'node:fs';

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../../../data/${name}`, import.meta.url), 'utf8'));

export const MUNICIPALITIES = read('municipalities.json');
export const PRO_LOCO_REGISTRY = read('pro-loco-registry.json');
export const LOCALITIES = read('localities.json').entries;
export const SOURCE_REGISTRY = read('source-registry.json');

export function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function municipalityByName(value) {
  const key = normalize(value).replace(/^comune di /, '');
  return MUNICIPALITIES.find((item) => normalize(item.name) === key || item.aliases.some((alias) => normalize(alias) === key));
}


export function municipalityFromText(value) {
  const direct = municipalityByName(value);
  if (direct) return direct;
  const haystack = ` ${normalize(value)} `;
  const matches = [];
  for (const municipality of MUNICIPALITIES) {
    for (const label of [municipality.name, ...(municipality.aliases || [])]) {
      const needle = normalize(label);
      if (needle && haystack.includes(` ${needle} `)) matches.push({ municipality, length: needle.length });
    }
  }
  matches.sort((left, right) => right.length - left.length);
  return matches[0]?.municipality || null;
}

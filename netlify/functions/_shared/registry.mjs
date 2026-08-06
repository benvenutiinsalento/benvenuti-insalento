// Registro territorio/fonti. I JSON sono importati staticamente: il bundler
// esbuild di Netlify li incorpora nella funzione (niente fs.readFileSync, che
// in Lambda non trova ../../../data perche' il bundle lavora in /var/task).
import municipalitiesData from '../../../data/municipalities.json' with { type: 'json' };
import proLocoRegistryData from '../../../data/pro-loco-registry.json' with { type: 'json' };
import localitiesData from '../../../data/localities.json' with { type: 'json' };
import sourceRegistryData from '../../../data/source-registry.json' with { type: 'json' };

export const MUNICIPALITIES = municipalitiesData;
export const PRO_LOCO_REGISTRY = proLocoRegistryData;
export const LOCALITIES = localitiesData.entries;
export const SOURCE_REGISTRY = sourceRegistryData;

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

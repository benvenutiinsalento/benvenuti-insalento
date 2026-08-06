// Territorio (mandato): 96 Comuni, alias obbligatori, frazioni/marine tipizzate,
// coordinate per distanza "centro Comune".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const MUNICIPALITIES = JSON.parse(fs.readFileSync(new URL('../data/municipalities.json', import.meta.url)));
const LOCALITIES = JSON.parse(fs.readFileSync(new URL('../data/localities.json', import.meta.url))).entries;

const MANDATORY = [
  ['Torre Lapillo', 'Porto Cesareo'],
  ['Punta Prosciutto', 'Porto Cesareo'],
  ['Vignacastrisi', 'Ortelle'],
  ['Borgagne', 'Melendugno'],
  ['Castiglione d’Otranto', 'Andrano'],
  ['Acaya', 'Vernole'],
  ['San Cataldo', 'Lecce'],
  ['Torre Chianca', 'Lecce'],
  ['Frigole', 'Lecce'],
  ['Marina Serra', 'Tricase'],
  ['Pescoluse', 'Salve'],
  ['Torre Pali', 'Salve'],
  ['Santa Maria di Leuca', 'Castrignano del Capo'],
];
const VALID_TYPES = new Set(['frazione', 'marina', 'borgo', 'localita', 'alias']);

test('il registro contiene esattamente i 96 Comuni della provincia di Lecce', () => {
  assert.equal(MUNICIPALITIES.length, 96);
  assert.equal(new Set(MUNICIPALITIES.map((m) => m.slug)).size, 96);
});

test('tutti i 13 alias obbligatori del mandato sono mappati al Comune corretto', () => {
  for (const [alias, municipalityName] of MANDATORY) {
    const municipality = MUNICIPALITIES.find((m) => (m.aliases || []).includes(alias));
    assert.ok(municipality, `alias mancante: ${alias}`);
    assert.equal(municipality.name, municipalityName, `${alias} assegnato a ${municipality.name} invece di ${municipalityName}`);
  }
});

test('ogni Comune ha coordinate reali nel rettangolo della provincia di Lecce', () => {
  for (const m of MUNICIPALITIES) {
    assert.ok(typeof m.latitude === 'number' && typeof m.longitude === 'number', `${m.name} senza coordinate`);
    assert.ok(m.latitude > 39.5 && m.latitude < 40.7, `${m.name} lat ${m.latitude} fuori provincia`);
    assert.ok(m.longitude > 17.8 && m.longitude < 18.8, `${m.name} lng ${m.longitude} fuori provincia`);
    assert.ok(/^\d{6}$/.test(m.istat || ''), `${m.name} senza codice ISTAT`);
    assert.ok(m.istat.startsWith('075'), `${m.name} ISTAT non Lecce`);
  }
});

test('le località del registro tipizzato coprono tutti gli alias Comuni', () => {
  const byTown = new Map(LOCALITIES.map((entry) => [entry.municipality, new Set(entry.localities.map((l) => l.name))]));
  for (const m of MUNICIPALITIES) {
    for (const alias of m.aliases || []) {
      const set = byTown.get(m.name);
      assert.ok(set && set.has(alias), `località tipizzata mancante: ${alias} (${m.name})`);
    }
  }
});

test('le località tipizzate usano solo tipi ammessi dal mandato', () => {
  for (const entry of LOCALITIES) {
    const municipality = MUNICIPALITIES.find((m) => m.name === entry.municipality);
    assert.ok(municipality, `municipio sconosciuto: ${entry.municipality}`);
    for (const loc of entry.localities) {
      assert.ok(VALID_TYPES.has(loc.type), `${loc.name} ha tipo non ammesso: ${loc.type}`);
      assert.ok(loc.name.length >= 2);
    }
  }
});

import { classifyEvent, detectEventStatus, normalizeSearchText } from "./events-core.mjs";

const MONTHS = new Map([
  ["gennaio", "01"], ["gen", "01"], ["febbraio", "02"], ["feb", "02"], ["marzo", "03"], ["mar", "03"],
  ["aprile", "04"], ["apr", "04"], ["maggio", "05"], ["mag", "05"], ["giugno", "06"], ["giu", "06"],
  ["luglio", "07"], ["lug", "07"], ["agosto", "08"], ["ago", "08"], ["settembre", "09"], ["set", "09"],
  ["ottobre", "10"], ["ott", "10"], ["novembre", "11"], ["nov", "11"], ["dicembre", "12"], ["dic", "12"],
]);

function decodeHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>|<\/li>|<\/h\d>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&agrave;/gi, "à")
    .replace(/&egrave;/gi, "è")
    .replace(/&igrave;/gi, "ì")
    .replace(/&ograve;/gi, "ò")
    .replace(/&ugrave;/gi, "ù")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function isoDate(value, fallbackYear) {
  if (value == null || value === "") return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number" && Number.isFinite(value)) {
    const milliseconds = value > 10_000_000_000 ? value : value * 1000;
    const parsed = new Date(milliseconds);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  const direct = raw.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/);
  if (direct) return `${direct[1]}-${direct[2].padStart(2, "0")}-${direct[3].padStart(2, "0")}`;
  const european = raw.match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](20\d{2})\b/);
  if (european) return `${european[3]}-${european[2].padStart(2, "0")}-${european[1].padStart(2, "0")}`;
  const italian = normalizeSearchText(raw).match(/(?:lunedi|martedi|mercoledi|giovedi|venerdi|sabato|domenica)?\s*(\d{1,2})\s+(gennaio|gen|febbraio|feb|marzo|mar|aprile|apr|maggio|mag|giugno|giu|luglio|lug|agosto|ago|settembre|set|ottobre|ott|novembre|nov|dicembre|dic)(?:\s+(20\d{2}))?/i);
  if (!italian) return "";
  const month = MONTHS.get(italian[2]);
  const year = italian[3] || fallbackYear;
  return month && year ? `${year}-${month}-${italian[1].padStart(2, "0")}` : "";
}

function array(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function eventFromJsonLd(item, source, fallbackTown) {
  if (!item || !/Event$/i.test(String(item["@type"] || ""))) return null;
  const location = item.location || {};
  const address = typeof location.address === "object" ? location.address : {};
  const town = address.addressLocality || fallbackTown || "";
  const startDate = isoDate(item.startDate, source.year);
  if (!startDate) return null;
  const endDate = isoDate(item.endDate, source.year) || startDate;
  const statusUrl = String(item.eventStatus || "");
  const status = /cancel/i.test(statusUrl) ? "cancelled" : /postpon/i.test(statusUrl) ? "postponed" : "published";
  return {
    title: decodeHtml(item.name || ""),
    description: decodeHtml(item.description || ""),
    startDate,
    endDate,
    occurrenceDates: [],
    originalTimeText: String(item.startDate || "").includes("T") ? String(item.startDate).split("T")[1]?.slice(0, 5) : "",
    town,
    locality: town && fallbackTown && town !== fallbackTown ? town : "",
    venue: decodeHtml(location.name || ""),
    address: decodeHtml([address.streetAddress, address.postalCode, town].filter(Boolean).join(", ")),
    latitude: Number(location.geo?.latitude) || undefined,
    longitude: Number(location.geo?.longitude) || undefined,
    priceText: item.isAccessibleForFree === true ? "Gratuito" : "Da verificare",
    priceType: item.isAccessibleForFree === true ? "free" : "unknown",
    organizer: decodeHtml(item.organizer?.name || ""),
    artists: array(item.performer).map((performer) => decodeHtml(performer?.name || performer)).filter(Boolean),
    tags: array(item.keywords).flatMap((keyword) => String(keyword).split(",")).map((tag) => tag.trim()).filter(Boolean),
    primaryCategory: classifyEvent(`${item.name || ""} ${item.description || ""}`),
    status,
    sourceUrl: item.url && /^https:\/\//.test(item.url) ? item.url : source.url,
    sourceName: source.entityName,
    sourcePriority: source.priority,
    sourceYear: source.year,
  };
}

export function parseHtmlEvents(html, source) {
  const discovered = [];
  const scripts = [...String(html).matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of scripts) {
    try {
      const value = JSON.parse(script[1]);
      const queue = array(value).flatMap((entry) => entry?.["@graph"] ? array(entry["@graph"]) : [entry]);
      for (const item of queue) {
        const event = eventFromJsonLd(item, source, source.municipality);
        if (event) discovered.push(event);
      }
    } catch {
      // Invalid third-party JSON-LD is ignored; the text parser still runs.
    }
  }
  if (discovered.length) return discovered;

  const text = decodeHtml(html);
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const date = isoDate(line, source.year);
    if (!date || !/(?:20\d{2}|gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)/i.test(line)) continue;
    const context = lines.slice(Math.max(0, index - 2), index + 5).join(" · ");
    const titleCandidate = lines[index - 1] && !isoDate(lines[index - 1], source.year) ? lines[index - 1] : line.replace(/^.*?(?:20\d{2}|gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*[-–:]?\s*/i, "");
    const title = decodeHtml(titleCandidate).slice(0, 140);
    if (title.length < 3) continue;
    discovered.push({
      title,
      description: context.slice(0, 600),
      startDate: date,
      endDate: date,
      occurrenceDates: [date],
      originalTimeText: context.match(/\b(?:ore|dalle?)\s*(\d{1,2}(?:[:.,]\d{2})?)/i)?.[0] || "",
      town: source.municipality || "",
      locality: source.locality || "",
      venue: "Luogo indicato nella fonte",
      address: source.municipality || "",
      priceText: /ingresso libero|gratuit/i.test(context) ? "Gratuito" : "Da verificare",
      priceType: /ingresso libero|gratuit/i.test(context) ? "free" : "unknown",
      primaryCategory: classifyEvent(context),
      status: detectEventStatus(context) || "draft",
      sourceUrl: source.url,
      sourceName: source.entityName,
      sourcePriority: source.priority,
      sourceYear: source.year,
    });
  }
  return discovered;
}

export function parseDatedTownCalendar(html, source) {
  const text = decodeHtml(String(html).replace(/<h[1-6][^>]*>/gi, "\n").replace(/<\/h[1-6]>/gi, "\n"));
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const events = [];
  let currentDate = "";
  for (let index = 0; index < lines.length; index += 1) {
    const headingDate = isoDate(lines[index], source.year);
    if (headingDate && /20\d{2}/.test(lines[index])) {
      currentDate = headingDate;
      continue;
    }
    if (!currentDate) continue;
    const match = lines[index].match(/^([A-ZÀ-Ù0-9][A-ZÀ-Ù0-9'’ .-]{1,55})\s*[–—-]\s*(.{4,})$/);
    if (!match) continue;
    const town = match[1].trim().replace(/\s*\([^)]+\)\s*$/, "");
    const details = match[2].trim();
    const title = details.split(/[;.]|\s+ore\s+/i)[0].replace(/^(?:piazza|via|villa|parco|centro storico),?\s*/i, "").slice(0, 140);
    if (!title || /pubblicita/i.test(title)) continue;
    events.push({
      title, description: details.slice(0, 600), startDate: currentDate, endDate: currentDate, occurrenceDates: [currentDate],
      originalTimeText: details.match(/\b(?:ore|dalle?)\s*(\d{1,2}(?:[:.,]\d{2})?)/i)?.[0] || "", town, locality: "",
      venue: details.match(/^(.*?)(?:,|\s+ore\s+)/i)?.[1] || "Luogo indicato nel calendario", address: town,
      priceText: /ingresso libero|gratuit/i.test(details) ? "Gratuito" : "Da verificare", priceType: /ingresso libero|gratuit/i.test(details) ? "free" : "unknown",
      primaryCategory: classifyEvent(details), status: detectEventStatus(details) || "draft", sourceUrl: source.url, sourceName: source.entityName,
      sourcePriority: source.priority, sourceYear: source.year,
    });
  }
  return events;
}

export function parseTorrevadoCalendar(html, source) {
  const text = decodeHtml(html);
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const events = [];
  let sectionYear = source.year || String(new Date().getUTCFullYear());
  for (const line of lines) {
    const match = line.match(/^(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*[–—-]\s*(.+?)\s*[–—-]\s*([^.–—]{2,60})\.?$/i);
    if (!match) continue;
    const startDate = isoDate(`${match[1]} ${match[3]} ${sectionYear}`, sectionYear);
    const endDate = isoDate(`${match[2] || match[1]} ${match[3]} ${sectionYear}`, sectionYear);
    const title = match[4].trim();
    const townRaw = match[5].trim();
    const locality = townRaw.match(/^(.+?)\s*\(([^)]+)\)$/)?.[1] || "";
    const town = townRaw.match(/^(.+?)\s*\(([^)]+)\)$/)?.[2] || townRaw;
    events.push({
      title, description: line, startDate, endDate, occurrenceDates: match[2] ? [] : [startDate], originalTimeText: "",
      town, locality, venue: locality || town, address: townRaw, priceText: "Da verificare", priceType: "unknown",
      primaryCategory: classifyEvent(title), status: detectEventStatus(line) || "draft", sourceUrl: source.url, sourceName: source.entityName,
      sourcePriority: source.priority, sourceYear: sectionYear,
    });
  }
  return events;
}

export function parseIcs(text, source) {
  const unfolded = String(text).replace(/\r?\n[ \t]/g, "");
  return unfolded.split("BEGIN:VEVENT").slice(1).map((block) => {
    const read = (name) => block.match(new RegExp(`(?:^|\\r?\\n)${name}(?:;[^:]*)?:(.*)`, "i"))?.[1]?.trim() || "";
    const startRaw = read("DTSTART");
    const endRaw = read("DTEND");
    const startDate = startRaw.match(/(20\d{2})(\d{2})(\d{2})/)?.slice(1, 4).join("-") || "";
    let endDate = endRaw.match(/(20\d{2})(\d{2})(\d{2})/)?.slice(1, 4).join("-") || startDate;
    if (/VALUE=DATE/i.test(block) && endRaw && endDate > startDate) {
      const date = new Date(`${endDate}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - 1); endDate = date.toISOString().slice(0, 10);
    }
    const title = read("SUMMARY").replace(/\\,/g, ",");
    const description = read("DESCRIPTION").replace(/\\n/g, " ").replace(/\\,/g, ",");
    const location = read("LOCATION").replace(/\\,/g, ",");
    return {
      title, description, startDate, endDate, occurrenceDates: [startDate], town: source.municipality || "", locality: source.locality || "",
      venue: location, address: location, originalTimeText: startRaw.includes("T") ? startRaw.split("T")[1]?.slice(0, 4).replace(/(\d{2})(\d{2})/, "$1:$2") : "",
      priceText: "Da verificare", priceType: "unknown", primaryCategory: classifyEvent(`${title} ${description}`), status: detectEventStatus(description) || "draft",
      sourceUrl: source.url, sourceName: source.entityName, sourcePriority: source.priority, sourceYear: source.year,
    };
  }).filter((event) => event.title && event.startDate);
}

function normalizedKey(value = "") {
  return normalizeSearchText(value).replace(/\s+/g, "");
}

function flattenRecord(record, maxDepth = 4) {
  const map = new Map();
  const visit = (value, path = [], depth = 0) => {
    if (value == null || depth > maxDepth) return;
    if (Array.isArray(value)) {
      if (value.every((item) => item == null || ["string", "number", "boolean"].includes(typeof item))) {
        const joined = value.filter((item) => item != null && String(item).trim()).join(", ");
        if (joined) map.set(normalizedKey(path.join(" ")), joined);
      }
      return;
    }
    if (typeof value !== "object") {
      const text = typeof value === "string" ? value.trim() : value;
      if (text === "") return;
      const full = normalizedKey(path.join(" "));
      const leaf = normalizedKey(path.at(-1) || "");
      if (full && !map.has(full)) map.set(full, text);
      if (leaf && !map.has(leaf)) map.set(leaf, text);
      return;
    }
    for (const [key, child] of Object.entries(value)) visit(child, [...path, key], depth + 1);
  };
  visit(record);
  return map;
}

function pickField(fields, aliases) {
  for (const alias of aliases) {
    const key = normalizedKey(alias);
    if (fields.has(key)) return fields.get(key);
  }
  for (const alias of aliases) {
    const key = normalizedKey(alias);
    for (const [field, value] of fields) {
      if (field.endsWith(key) || field.startsWith(key)) return value;
    }
  }
  return "";
}

function primitiveCoordinate(value) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

function eventArrayScore(rows) {
  if (!Array.isArray(rows) || !rows.length || typeof rows[0] !== "object" || rows[0] == null) return -1;
  const samples = rows.slice(0, 5);
  let score = 0;
  for (const sample of samples) {
    const fields = flattenRecord(sample, 2);
    if (pickField(fields, ["titolo", "title", "nome evento", "denominazione"])) score += 3;
    if (pickField(fields, ["data inizio", "start date", "data evento", "dal"])) score += 3;
    if (pickField(fields, ["comune", "citta", "address locality", "municipality"])) score += 2;
    if (pickField(fields, ["descrizione", "description", "luogo", "location"])) score += 1;
  }
  return score + Math.min(5, Math.log10(rows.length + 1));
}

function findEventRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const preferred = ["eventi", "events", "items", "records", "data", "results", "result"];
  for (const name of preferred) {
    const direct = Object.entries(payload).find(([key]) => normalizedKey(key) === normalizedKey(name))?.[1];
    if (Array.isArray(direct) && eventArrayScore(direct) >= 3) return direct;
    if (direct && typeof direct === "object") {
      const nested = findEventRows(direct);
      if (nested.length && eventArrayScore(nested) >= 3) return nested;
    }
  }
  const candidates = [];
  const walk = (value, depth = 0) => {
    if (depth > 5 || value == null) return;
    if (Array.isArray(value)) {
      candidates.push(value);
      return;
    }
    if (typeof value === "object") Object.values(value).forEach((child) => walk(child, depth + 1));
  };
  walk(payload);
  return candidates.sort((left, right) => eventArrayScore(right) - eventArrayScore(left))[0] || [];
}

export function parsePugliaJson(payload, source) {
  const rows = findEventRows(payload);
  return rows.map((row) => {
    if (!row || typeof row !== "object") return null;
    const fields = flattenRecord(row);
    const title = pickField(fields, [
      "nm evento it", "titolo", "title", "nome evento", "nome attivita", "denominazione evento", "denominazione", "event name", "name",
    ]);
    const startRaw = pickField(fields, [
      "data inizio", "datainizio", "start date", "startdate", "data evento", "dataevento", "inizio", "dal", "validita inizio",
    ]);
    const endRaw = pickField(fields, [
      "data fine", "datafine", "end date", "enddate", "fine", "al", "validita fine",
    ]);
    const startDate = isoDate(startRaw, source.year);
    const endDate = isoDate(endRaw, source.year) || startDate;
    const town = pickField(fields, [
      "comune", "nome comune", "comune evento", "citta", "city", "address locality", "addresslocality", "municipality",
    ]);
    const locality = pickField(fields, ["frazione", "localita specifica", "localita", "borgo", "marina"]);
    const description = pickField(fields, ["dsc evento it", "abstract evento it", "snippet evento it", "descrizione", "description", "testo", "abstract", "sintesi"]);
    const venue = pickField(fields, ["nome location", "luogo", "nome luogo", "location name", "sede", "venue"]);
    const address = pickField(fields, ["indirizzo", "address", "street address", "streetaddress", "ubicazione"]);
    const price = pickField(fields, ["prezzo", "price", "costo", "tariffa", "ingresso"]);
    const organizer = pickField(fields, ["organizzatore", "organizer", "ente organizzatore", "promotore"]);
    const category = pickField(fields, ["categoria", "category", "tipologia", "tipo evento"]);
    const time = pickField(fields, ["orario", "time", "ora inizio", "start time"]);
    const sourceUrlRaw = pickField(fields, ["url", "link", "sito web", "website", "pagina evento", "event url"]);
    const imageUrl = pickField(fields, ["immagine", "image", "image url", "foto", "locandina"]);
    const bookingUrl = pickField(fields, ["link prenotazioni", "prenotazione", "booking url", "ticket url", "biglietti", "ticket"]);
    const latitude = primitiveCoordinate(pickField(fields, ["latitudine", "latitude", "geo latitude"]));
    const longitude = primitiveCoordinate(pickField(fields, ["longitudine", "longitude", "geo longitude", "lng", "lon"]));
    let sourceUrl = String(sourceUrlRaw || source.url).trim();
    try { sourceUrl = new URL(sourceUrl, source.url).href; } catch { sourceUrl = source.url; }
    const priceText = decodeHtml(price || "Da verificare");
    const combined = `${title || ""} ${category || ""} ${description || ""}`;
    return {
      title: decodeHtml(title),
      description: decodeHtml(description),
      startDate,
      endDate,
      occurrenceDates: [],
      originalTimeText: decodeHtml(time),
      town: decodeHtml(town),
      locality: decodeHtml(locality),
      venue: decodeHtml(venue),
      address: decodeHtml(address),
      latitude,
      longitude,
      priceText,
      priceType: /grat|libero|free/i.test(priceText) ? "free" : /(?:€|euro|pagamento|ticket|bigliett)/i.test(priceText) ? "paid" : "unknown",
      organizer: decodeHtml(organizer),
      artists: [],
      tags: category ? [decodeHtml(category)] : [],
      primaryCategory: classifyEvent(combined),
      status: detectEventStatus(combined) || "draft",
      sourceUrl: /^https:\/\//i.test(sourceUrl) ? sourceUrl : source.url,
      sourceName: source.entityName,
      sourcePriority: source.priority,
      sourceYear: source.year,
      imageUrl: /^https:\/\//i.test(String(imageUrl)) ? String(imageUrl) : "",
      bookingUrl: /^https:\/\//i.test(String(bookingUrl)) ? String(bookingUrl) : "",
      sourceRecordKeys: Object.keys(row).slice(0, 60),
    };
  }).filter((event) => event?.title && event.startDate && event.town);
}

export function extractPdfText(bytes) {
  const binary = typeof bytes === "string" ? bytes : new TextDecoder("latin1").decode(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
  if (!binary.startsWith("%PDF")) return "";
  const strings = [];
  for (const match of binary.matchAll(/\(((?:\\.|[^\\)]){2,})\)\s*Tj/g)) strings.push(match[1]);
  for (const match of binary.matchAll(/\[(.*?)\]\s*TJ/gs)) {
    strings.push([...match[1].matchAll(/\(((?:\\.|[^\\)])+)\)/g)].map((part) => part[1]).join(""));
  }
  return strings.join("\n").replace(/\\([()\\])/g, "$1").replace(/\\n/g, "\n");
}

export async function extractOcrText(bytes, options = {}) {
  if (typeof options.ocr === "function") return options.ocr(bytes);
  if (!options.endpoint || !options.apiKey) throw new Error("OCR_NOT_CONFIGURED");
  const body = new FormData();
  body.set("language", "ita");
  body.set("isOverlayRequired", "false");
  body.set("file", new Blob([bytes]), "document");
  const response = await fetch(options.endpoint, { method: "POST", headers: { apikey: options.apiKey }, body });
  if (!response.ok) throw new Error(`OCR_HTTP_${response.status}`);
  const payload = await response.json();
  return (payload.ParsedResults || []).map((result) => result.ParsedText || "").join("\n");
}

export function parsePosterText(text, source) {
  const clean = decodeHtml(text);
  const dates = [...clean.matchAll(/\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(20\d{2}))?/gi)]
    .map((match) => isoDate(match[0], source.year)).filter(Boolean);
  const title = clean.split(/\n+/).map((line) => line.trim()).find((line) => line.length >= 4 && line.length <= 120 && !isoDate(line, source.year)) || "";
  const town = source.municipality || clean.match(/\b(?:Comune di\s+)?([A-ZÀ-Ù][A-Za-zÀ-ù'’ -]{2,40})\s*\(LE\)/)?.[1] || "";
  const time = clean.match(/\b(?:ore|dalle?)\s*(\d{1,2}(?:[:.,]\d{2})?)/i)?.[0] || "";
  return dates.length ? [{
    title, description: clean.slice(0, 1200), startDate: dates[0], endDate: dates.at(-1), occurrenceDates: [...new Set(dates)], originalTimeText: time,
    town, locality: source.locality || "", venue: "Luogo indicato nella locandina", address: town, priceText: /ingresso libero|gratuit/i.test(clean) ? "Gratuito" : "Da verificare",
    priceType: /ingresso libero|gratuit/i.test(clean) ? "free" : "unknown", primaryCategory: classifyEvent(clean), status: detectEventStatus(clean) || "draft",
    sourceUrl: source.url, sourceName: source.entityName, sourcePriority: source.priority, sourceYear: source.year,
  }] : [];
}

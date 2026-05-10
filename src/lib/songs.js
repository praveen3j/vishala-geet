export function isValidEntry(entry) {
  return entry && typeof entry.name === "string" && typeof entry.page === "string";
}

export function normalize(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isPlaceholderEntry(entry) {
  return Boolean(entry.id && entry.id.startsWith("placeholder-"));
}

export function managedIdFor(entry, index) {
  const base = normalize(`${entry.name}-${entry.page}-${index}`).replace(/[^a-z0-9]+/g, "-");
  return `managed-${base || index}`;
}

export function cleanEntry(entry, fallbackSource = "local", index = 0) {
  return {
    id: entry.id || (fallbackSource === "managed" ? managedIdFor(entry, index) : makeId()),
    name: String(entry.name || "").trim(),
    page: String(entry.page || "").trim(),
    aliases: String(entry.aliases || "").trim(),
    notes: String(entry.notes || "").trim(),
    source: entry.source || fallbackSource,
    updatedAt: entry.updatedAt || new Date().toISOString()
  };
}

function placeholderPageScore(page, query) {
  const normalizedPage = normalize(page);
  if (!query) return 1;
  if (query === normalizedPage) return 95;
  if (query === `page ${normalizedPage}` || query === `p${normalizedPage}`) return 90;
  return 0;
}

export function scoreEntry(entry, query) {
  if (!query) return 1;
  if (isPlaceholderEntry(entry)) {
    return placeholderPageScore(entry.page, query);
  }

  const name = normalize(entry.name);
  const aliases = normalize(entry.aliases);
  const notes = normalize(entry.notes);
  const page = normalize(entry.page);
  const all = `${name} ${aliases} ${notes} ${page}`;

  if (name === query) return 100;
  if (page === query) return 95;
  if (name.startsWith(query)) return 80;
  if (name.includes(query)) return 60;
  if (page.includes(query)) return 55;
  if (aliases.includes(query)) return 45;
  if (all.includes(query)) return 25;
  return 0;
}

export function filterEntries(entries, queryText) {
  const query = normalize(queryText);

  return entries
    .map(entry => ({ entry, score: scoreEntry(entry, query) }))
    .filter(item => !query || item.score > 0)
    .sort((a, b) => {
      if (!query) {
        const pageA = Number.parseInt(a.entry.page, 10);
        const pageB = Number.parseInt(b.entry.page, 10);
        if (Number.isFinite(pageA) && Number.isFinite(pageB) && pageA !== pageB) {
          return pageA - pageB;
        }
      }

      if (b.score !== a.score) return b.score - a.score;
      return normalize(a.entry.name).localeCompare(normalize(b.entry.name));
    })
    .map(item => item.entry);
}

export function songMeta(entry) {
  const meta = [];

  if (isPlaceholderEntry(entry)) {
    meta.push(`Title unreadable from photo. Search by page number: ${entry.page}.`);
    if (entry.notes) meta.push("Needs verification.");
    return meta.join(" | ");
  }

  if (entry.source === "managed") meta.push("Maintained list");
  if (entry.aliases) meta.push(`Also: ${entry.aliases}`);
  if (entry.notes) meta.push(entry.notes);
  return meta.length ? meta.join(" | ") : "Saved song entry";
}

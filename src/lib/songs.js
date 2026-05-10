export function isValidEntry(entry) {
  const name = entry?.name ?? entry?.songName;
  const page = entry?.page ?? entry?.pageNumber;
  return entry && name !== undefined && page !== undefined;
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

  return Date.now() + "-" + Math.random().toString(36).slice(2);
}

export function isPlaceholderEntry(entry) {
  return Boolean(entry.id && String(entry.id).startsWith("placeholder-"));
}

export function bookLabel(entry) {
  const rawBook = entry.book ?? entry.bookName ?? entry.bookNumber ?? entry.bookId ?? "1";
  const text = String(rawBook || "1").trim();
  if (!text) return "Book 1";
  const bookMatch = text.match(/^book\s*(.+)$/i);
  if (bookMatch) return "Book " + bookMatch[1].trim();
  return "Book " + text;
}

export function bookNumber(entry) {
  const match = bookLabel(entry).match(/\d+/);
  return match ? match[0] : "";
}

export function pageLabel(entry) {
  return bookLabel(entry) + ", Page " + entry.page;
}

export function managedIdFor(entry, index) {
  const name = entry.name ?? entry.songName;
  const page = entry.page ?? entry.pageNumber;
  const base = normalize(bookLabel(entry) + "-" + name + "-" + page + "-" + index).replace(
    /[^a-z0-9]+/g,
    "-"
  );
  return "managed-" + (base || index);
}

export function cleanEntry(entry, fallbackSource = "local", index = 0) {
  const name = entry.name ?? entry.songName;
  const page = entry.page ?? entry.pageNumber;
  const aliases = entry.aliases ?? entry.otherNames;

  return {
    id: String(entry.id || (fallbackSource === "managed" ? managedIdFor(entry, index) : makeId())),
    name: String(name || "").trim(),
    book: bookLabel(entry),
    page: String(page || "").trim(),
    aliases: String(aliases || "").trim(),
    notes: String(entry.notes || "").trim(),
    source: entry.source || fallbackSource,
    updatedAt: entry.updatedAt || new Date().toISOString()
  };
}

function placeholderPageScore(entry, query) {
  const normalizedPage = normalize(entry.page);
  const book = normalize(bookLabel(entry));
  if (!query) return 1;
  if (query === normalizedPage) return 95;
  if (query === book + " page " + normalizedPage) return 98;
  if (query === "page " + normalizedPage || query === "p" + normalizedPage) return 90;
  return 0;
}

export function scoreEntry(entry, query) {
  if (!query) return 1;
  if (isPlaceholderEntry(entry)) {
    return placeholderPageScore(entry, query);
  }

  const name = normalize(entry.name);
  const aliases = normalize(entry.aliases);
  const notes = normalize(entry.notes);
  const book = normalize(bookLabel(entry));
  const bookNo = normalize(bookNumber(entry));
  const page = normalize(entry.page);
  const pageSearch =
    book +
    " page " +
    page +
    " " +
    book +
    " p" +
    page +
    " b" +
    bookNo +
    " page " +
    page +
    " b" +
    bookNo +
    " p" +
    page;
  const all = name + " " + aliases + " " + notes + " " + book + " " + page + " " + pageSearch;

  if (name === query) return 100;
  if (query === book + " page " + page || query === book + " p" + page) return 98;
  if (query === "b" + bookNo + " page " + page || query === "b" + bookNo + " p" + page) return 97;
  if (page === query) return 95;
  if (name.startsWith(query)) return 80;
  if (name.includes(query)) return 60;
  if (pageSearch.includes(query)) return 58;
  if (page.includes(query)) return 55;
  if (aliases.includes(query)) return 45;
  if (all.includes(query)) return 25;
  return 0;
}

export function filterEntries(entries, queryText) {
  const query = normalize(queryText);

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((item) => !query || item.score > 0)
    .sort((a, b) => {
      if (!query) {
        const bookCompare = normalize(bookLabel(a.entry)).localeCompare(normalize(bookLabel(b.entry)));
        if (bookCompare) return bookCompare;

        const pageA = Number.parseInt(a.entry.page, 10);
        const pageB = Number.parseInt(b.entry.page, 10);
        if (Number.isFinite(pageA) && Number.isFinite(pageB) && pageA !== pageB) {
          return pageA - pageB;
        }
      }

      if (b.score !== a.score) return b.score - a.score;
      const bookCompare = normalize(bookLabel(a.entry)).localeCompare(normalize(bookLabel(b.entry)));
      if (bookCompare) return bookCompare;
      return normalize(a.entry.name).localeCompare(normalize(b.entry.name));
    })
    .map((item) => item.entry);
}

export function songMeta(entry) {
  const meta = [];

  if (isPlaceholderEntry(entry)) {
    meta.push("Title unreadable from photo. Search by page number: " + entry.page + ".");
    if (entry.notes) meta.push("Needs verification.");
    return meta.join(" | ");
  }

  if (entry.source === "managed") meta.push("Maintained list");
  if (entry.aliases) meta.push("Also: " + entry.aliases);
  if (entry.notes) meta.push(entry.notes);
  return meta.length ? meta.join(" | ") : "Saved song entry";
}

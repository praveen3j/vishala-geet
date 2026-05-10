/* global console */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = ["public/assets/book1.json", "public/assets/book2.json"];

function sql(value) {
  return "'" + String(value ?? "").replaceAll("'", "''") + "'";
}

const rows = [];

for (const source of sources) {
  const file = JSON.parse(await readFile(path.join(root, source), "utf8"));
  const book = file.book || "Book";
  const entries = Array.isArray(file.entries) ? file.entries : [];
  for (const entry of entries) {
    rows.push({
      book: entry.book || book,
      name: entry.name || entry.songName || "",
      page: entry.page || entry.pageNumber || "",
      aliases: entry.aliases || entry.otherNames || "",
      notes: entry.notes || ""
    });
  }
}

const values = rows
  .filter((entry) => entry.name && entry.page)
  .map(
    (entry) =>
      `  (${sql(entry.book)}, ${sql(entry.name)}, ${sql(entry.page)}, ${sql(entry.aliases)}, ${sql(entry.notes)})`
  )
  .join(",\n");

const output = `-- Generated from public/assets/book1.json and public/assets/book2.json.\n-- Run supabase/schema.sql first.\n\ntruncate table public.songs restart identity;\n\ninsert into public.songs (book, name, page, aliases, notes)\nvalues\n${values};\n`;

await writeFile(path.join(root, "supabase/seed-songs.sql"), output, "utf8");
console.log(`Wrote ${rows.length} songs to supabase/seed-songs.sql`);

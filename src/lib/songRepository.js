import { bookLabel, cleanEntry } from "./songs.js";
import { supabase } from "./supabaseClient.js";

const SONG_COLUMNS = "id, book, name, page, aliases, notes, created_at, updated_at";

export function rowToEntry(row) {
  return cleanEntry(
    {
      id: row.id,
      name: row.name,
      book: row.book,
      page: row.page,
      aliases: row.aliases || "",
      notes: row.notes || "",
      updatedAt: row.updated_at || row.created_at
    },
    "managed"
  );
}

export function formToSongPayload(form) {
  return {
    book: bookLabel({ book: form.book }),
    name: form.name.trim(),
    page: String(form.page || "").trim(),
    aliases: String(form.aliases || "").trim(),
    notes: String(form.notes || "").trim()
  };
}

export async function fetchSongsFromBackend() {
  const { data, error } = await supabase.from("songs").select(SONG_COLUMNS);
  if (error) throw error;
  return (data || []).map(rowToEntry);
}

export async function insertSongInBackend(form) {
  const payload = formToSongPayload(form);
  const { data, error } = await supabase.from("songs").insert(payload).select(SONG_COLUMNS).single();
  if (error) throw error;
  return rowToEntry(data);
}

export async function updateSongInBackend(id, form) {
  const payload = formToSongPayload(form);
  const { data, error } = await supabase
    .from("songs")
    .update(payload)
    .eq("id", id)
    .select(SONG_COLUMNS)
    .single();
  if (error) throw error;
  return rowToEntry(data);
}

export async function deleteSongFromBackend(id) {
  const { error } = await supabase.from("songs").delete().eq("id", id);
  if (error) throw error;
}

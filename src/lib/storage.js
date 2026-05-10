import { LEGACY_STORAGE_KEYS, STORAGE_KEY } from "../constants.js";

export function readStoredSongs() {
  const currentRaw = localStorage.getItem(STORAGE_KEY);
  if (currentRaw) {
    return { raw: currentRaw, legacyKey: "" };
  }

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacyRaw = localStorage.getItem(key);
    if (legacyRaw) {
      return { raw: legacyRaw, legacyKey: key };
    }
  }

  return { raw: "", legacyKey: "" };
}

export function saveStoredSongs(entries, dataVersion) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      entries,
      dataVersion
    })
  );
}

export function removeStoredSongs(key) {
  localStorage.removeItem(key);
}

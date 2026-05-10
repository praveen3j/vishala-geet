import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AboutPanel from "./components/AboutPanel.jsx";
import AddSongPanel from "./components/AddSongPanel.jsx";
import AppHeader from "./components/AppHeader.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import Tabs from "./components/Tabs.jsx";
import Toast from "./components/Toast.jsx";
import { APP_NAME, BOOK_DATA_URLS } from "./constants.js";
import { csvCell, downloadFile } from "./lib/downloads.js";
import { bookLabel, cleanEntry, filterEntries, isValidEntry, makeId } from "./lib/songs.js";
import { readStoredSongs, removeStoredSongs, saveStoredSongs } from "./lib/storage.js";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [entries, setEntries] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [prefillName, setPrefillName] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  const dataVersionRef = useRef(0);
  const importInputRef = useRef(null);
  const toastTimerRef = useRef(0);

  useEffect(() => {
    dataVersionRef.current = dataVersion;
  }, [dataVersion]);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 2200);
  }, []);

  const mergeManagedEntries = useCallback((managedEntries, nextDataVersion) => {
    setEntries((currentEntries) => {
      const localEntries = currentEntries.filter((entry) => entry.source !== "managed");
      const nextEntries = [...managedEntries, ...localEntries];
      saveStoredSongs(nextEntries, nextDataVersion);
      return nextEntries;
    });
    setDataVersion(nextDataVersion);
  }, []);

  const loadManagedData = useCallback(
    async (showMessage = false, currentDataVersion = dataVersionRef.current) => {
      try {
        const books = await Promise.all(
          BOOK_DATA_URLS.map(async (url) => {
            const response = await fetch(`${url}?updated=${Date.now()}`, { cache: "no-store" });
            if (!response.ok) throw new Error("Data file not available");
            return response.json();
          })
        );

        const nextDataVersion = books.reduce((total, data) => total + Number(data.version || 0), 0);
        const cleaned = books.flatMap((data, bookIndex) => {
          const imported = Array.isArray(data.entries) ? data.entries : [];
          const book = data.book || `Book ${bookIndex + 1}`;
          return imported
            .filter(isValidEntry)
            .map((entry, index) =>
              cleanEntry({ ...entry, book: entry.book || book }, "managed", `${bookIndex}-${index}`)
            )
            .filter((entry) => entry.name && entry.page);
        });

        if (nextDataVersion > currentDataVersion || showMessage) {
          mergeManagedEntries(cleaned, nextDataVersion);
          showToast(cleaned.length ? "Song list refreshed." : "No maintained songs added yet.");
        }
      } catch {
        if (showMessage) showToast("Could not refresh the maintained list.");
      }
    },
    [mergeManagedEntries, showToast]
  );

  useEffect(() => {
    try {
      const stored = readStoredSongs();
      const parsed = stored.raw ? JSON.parse(stored.raw) : { entries: [], dataVersion: 0 };
      const rawEntries = Array.isArray(parsed) ? parsed : parsed.entries;
      const savedEntries = Array.isArray(rawEntries)
        ? rawEntries.filter(isValidEntry).map((entry) => cleanEntry(entry))
        : [];
      const savedDataVersion = Array.isArray(parsed) ? 0 : Number(parsed.dataVersion || 0);

      setEntries(savedEntries);
      setDataVersion(savedDataVersion);
      dataVersionRef.current = savedDataVersion;

      if (stored.legacyKey) {
        saveStoredSongs(savedEntries, savedDataVersion);
        removeStoredSongs(stored.legacyKey);
      }

      loadManagedData(false, savedDataVersion);
    } catch {
      setEntries([]);
      setDataVersion(0);
      showToast("Could not load saved songs.");
      loadManagedData(false, 0);
    }
  }, [loadManagedData, showToast]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredInstallPrompt(event);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
    }
  }, []);

  const matches = useMemo(() => filterEntries(entries, query), [entries, query]);

  const dataStatus = useMemo(() => {
    const managedCount = entries.filter((entry) => entry.source === "managed").length;
    const localCount = entries.length - managedCount;
    const versionText = dataVersion ? `Version ${dataVersion}` : "No maintained list loaded yet";
    const extra = localCount ? `, plus ${localCount} phone-added ${localCount === 1 ? "song" : "songs"}` : "";
    const bookCount = new Set(entries.map(bookLabel)).size;
    const bookText = bookCount ? ` across ${bookCount} ${bookCount === 1 ? "book" : "books"}` : "";
    return `${versionText}. ${managedCount} maintained ${managedCount === 1 ? "song" : "songs"}${bookText}${extra}.`;
  }, [dataVersion, entries]);

  async function installApp() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
  }

  function openAddPanel() {
    setEditingEntry(null);
    setPrefillName("");
    setActiveTab("add");
  }

  function addMissingSong() {
    setEditingEntry(null);
    setPrefillName(query);
    setActiveTab("add");
  }

  function editEntry(entry) {
    setEditingEntry(entry);
    setPrefillName("");
    setActiveTab("add");
  }

  function resetDraft() {
    setEditingEntry(null);
    setPrefillName("");
  }

  function saveSong(form) {
    const songName = form.name.trim();
    const book = String(form.book || "Book 1").trim() || "Book 1";
    const page = form.page.trim();

    if (!songName || !page) {
      showToast("Song name and page number are required.");
      return;
    }

    const id = form.id || makeId();
    const nextEntry = {
      id,
      name: songName,
      book: bookLabel({ book }),
      page,
      aliases: form.aliases.trim(),
      notes: form.notes.trim(),
      source: "local",
      updatedAt: new Date().toISOString()
    };

    setEntries((currentEntries) => {
      const existingEntry = currentEntries.find((entry) => entry.id === id);
      const nextSong = {
        ...nextEntry,
        source: existingEntry ? existingEntry.source : "local"
      };
      const existingIndex = currentEntries.findIndex((entry) => entry.id === id);
      const nextEntries =
        existingIndex >= 0
          ? currentEntries.map((entry, index) => (index === existingIndex ? nextSong : entry))
          : [...currentEntries, nextSong];

      saveStoredSongs(nextEntries, dataVersionRef.current);
      return nextEntries;
    });

    showToast(form.id ? "Song updated." : "Song saved.");
    setEditingEntry(null);
    setPrefillName("");
    setQuery(songName);
    setActiveTab("search");
  }

  function exportJson() {
    const payload = {
      app: APP_NAME,
      version: 1,
      dataVersion,
      exportedAt: new Date().toISOString(),
      entries
    };
    downloadFile("vishala-geet-backup.json", JSON.stringify(payload, null, 2), "application/json");
    showToast("Backup exported.");
  }

  function exportCsv() {
    const header = ["Book", "Song Name", "Page Number", "Other Names", "Notes"];
    const rows = entries.map((entry) => [
      bookLabel(entry),
      entry.name,
      entry.page,
      entry.aliases,
      entry.notes
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    downloadFile("vishala-geet.csv", csv, "text/csv");
    showToast("CSV exported.");
  }

  function importJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const imported = Array.isArray(parsed) ? parsed : parsed.entries;
        if (!Array.isArray(imported)) throw new Error("Missing entries");

        const cleaned = imported
          .filter(isValidEntry)
          .map((entry) => cleanEntry(entry, entry.source || "local"))
          .filter((entry) => entry.name && entry.page);

        if (!cleaned.length) {
          showToast("No valid songs found in the file.");
          return;
        }

        const confirmed = confirm(`Import ${cleaned.length} songs? This will replace the current list.`);
        if (!confirmed) return;

        const nextDataVersion = Number(parsed.dataVersion || 0);
        setEntries(cleaned);
        setDataVersion(nextDataVersion);
        saveStoredSongs(cleaned, nextDataVersion);
        setQuery("");
        setActiveTab("search");
        showToast("Backup imported.");
      } catch {
        showToast("Could not import that backup file.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="app">
      <AppHeader canInstall={Boolean(deferredInstallPrompt)} onInstall={installApp} />
      <Tabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "search" && (
        <SearchPanel
          entries={entries}
          matches={matches}
          onAddFirst={openAddPanel}
          onAddMissing={addMissingSong}
          onEdit={editEntry}
          query={query}
          setQuery={setQuery}
        />
      )}
      {activeTab === "add" && (
        <AddSongPanel
          editingEntry={editingEntry}
          isActive={activeTab === "add"}
          onResetDraft={resetDraft}
          onSubmit={saveSong}
          prefillName={prefillName}
        />
      )}
      {activeTab === "about" && (
        <AboutPanel
          dataStatus={dataStatus}
          importInputRef={importInputRef}
          onExportCsv={exportCsv}
          onExportJson={exportJson}
          onImportClick={() => importInputRef.current?.click()}
          onImportFile={importJsonFile}
          onRefreshData={() => loadManagedData(true)}
        />
      )}
      <Toast message={toastMessage} />
    </main>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AboutPanel from "./components/AboutPanel.jsx";
import AddSongPanel from "./components/AddSongPanel.jsx";
import AppHeader from "./components/AppHeader.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import Tabs from "./components/Tabs.jsx";
import Toast from "./components/Toast.jsx";
import { APP_NAME, BOOK_DATA_URLS } from "./constants.js";
import { adminForEmail } from "./lib/admins.js";
import { csvCell, downloadFile } from "./lib/downloads.js";
import {
  deleteSongFromBackend,
  fetchSongsFromBackend,
  insertSongInBackend,
  updateSongInBackend
} from "./lib/songRepository.js";
import { bookLabel, cleanEntry, filterEntries, isValidEntry, makeId } from "./lib/songs.js";
import { readStoredSongs, removeStoredSongs, saveStoredSongs } from "./lib/storage.js";
import { isSupabaseConfigured, supabase } from "./lib/supabaseClient.js";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [entries, setEntries] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [prefillName, setPrefillName] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authStep, setAuthStep] = useState("email");
  const [authLoading, setAuthLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  const dataVersionRef = useRef(0);
  const importInputRef = useRef(null);
  const toastTimerRef = useRef(0);

  const userEmail = session?.user?.email || "";
  const adminProfile = useMemo(() => adminForEmail(userEmail), [userEmail]);
  const backendEnabled = isSupabaseConfigured;
  const canManage = backendEnabled && Boolean(adminProfile);

  useEffect(() => {
    dataVersionRef.current = dataVersion;
  }, [dataVersion]);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 2200);
  }, []);

  const cacheEntries = useCallback((nextEntries, nextDataVersion = dataVersionRef.current) => {
    saveStoredSongs(nextEntries, nextDataVersion);
  }, []);

  const mergeManagedEntries = useCallback(
    (managedEntries, nextDataVersion) => {
      setEntries((currentEntries) => {
        const localEntries = currentEntries.filter((entry) => entry.source !== "managed");
        const nextEntries = [...managedEntries, ...localEntries];
        cacheEntries(nextEntries, nextDataVersion);
        return nextEntries;
      });
      setDataVersion(nextDataVersion);
    },
    [cacheEntries]
  );

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

  const loadBackendData = useCallback(
    async (showMessage = false) => {
      if (!backendEnabled) return false;

      try {
        const backendEntries = await fetchSongsFromBackend();
        setEntries(backendEntries);
        setBackendOnline(true);
        cacheEntries(backendEntries);
        if (showMessage) showToast("Shared song list refreshed.");
        return true;
      } catch {
        setBackendOnline(false);
        if (showMessage) showToast("Could not reach the shared backend.");
        return false;
      }
    },
    [backendEnabled, cacheEntries, showToast]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const stored = readStoredSongs();
        const parsed = stored.raw ? JSON.parse(stored.raw) : { entries: [], dataVersion: 0 };
        const rawEntries = Array.isArray(parsed) ? parsed : parsed.entries;
        const savedEntries = Array.isArray(rawEntries)
          ? rawEntries.filter(isValidEntry).map((entry) => cleanEntry(entry))
          : [];
        const savedDataVersion = Array.isArray(parsed) ? 0 : Number(parsed.dataVersion || 0);

        if (cancelled) return;

        setEntries(savedEntries);
        setDataVersion(savedDataVersion);
        dataVersionRef.current = savedDataVersion;

        if (stored.legacyKey) {
          saveStoredSongs(savedEntries, savedDataVersion);
          removeStoredSongs(stored.legacyKey);
        }

        if (backendEnabled) {
          const loadedFromBackend = await loadBackendData(false);
          if (!loadedFromBackend && !savedEntries.length) {
            await loadManagedData(false, savedDataVersion);
          }
          return;
        }

        await loadManagedData(false, savedDataVersion);
      } catch {
        if (cancelled) return;
        setEntries([]);
        setDataVersion(0);
        showToast("Could not load saved songs.");
        await loadManagedData(false, 0);
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [backendEnabled, loadBackendData, loadManagedData, showToast]);

  useEffect(() => {
    if (!backendEnabled || !supabase) return undefined;

    let active = true;
    setAuthLoading(true);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session || null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [backendEnabled]);

  useEffect(() => {
    if (activeTab === "add" && !canManage) {
      setActiveTab("search");
      setEditingEntry(null);
      setPrefillName("");
    }
  }, [activeTab, canManage]);

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
    const bookCount = new Set(entries.map(bookLabel)).size;
    const bookText = bookCount ? ` across ${bookCount} ${bookCount === 1 ? "book" : "books"}` : "";

    if (backendEnabled) {
      const backendText = backendOnline
        ? "Shared backend"
        : "Shared backend configured, currently using cached data";
      const adminText = canManage ? "Admin editing is enabled." : "Sign in as an admin to manage songs.";
      return `${backendText}. ${entries.length} shared ${entries.length === 1 ? "song" : "songs"}${bookText}. ${adminText}`;
    }

    const managedCount = entries.filter((entry) => entry.source === "managed").length;
    const localCount = entries.length - managedCount;
    const versionText = dataVersion ? `Version ${dataVersion}` : "No maintained list loaded yet";
    const extra = localCount ? `, plus ${localCount} phone-added ${localCount === 1 ? "song" : "songs"}` : "";
    return `${versionText}. ${managedCount} maintained ${managedCount === 1 ? "song" : "songs"}${bookText}${extra}.`;
  }, [backendEnabled, backendOnline, canManage, dataVersion, entries]);

  async function installApp() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
  }

  function requireAdmin(action) {
    if (canManage) return true;
    const message = backendEnabled
      ? `Sign in with an approved admin email to ${action}.`
      : "Backend is not configured yet. Add Supabase keys before editing shared songs.";
    showToast(message);
    setActiveTab("about");
    return false;
  }

  function openAddPanel() {
    if (!requireAdmin("add songs")) return;
    setEditingEntry(null);
    setPrefillName("");
    setActiveTab("add");
  }

  function addMissingSong() {
    if (!requireAdmin("add songs")) return;
    setEditingEntry(null);
    setPrefillName(query);
    setActiveTab("add");
  }

  function editEntry(entry) {
    if (!requireAdmin("edit songs")) return;
    setEditingEntry(entry);
    setPrefillName("");
    setActiveTab("add");
  }

  function resetDraft() {
    setEditingEntry(null);
    setPrefillName("");
  }

  function finishSave(savedEntry, isUpdate) {
    setEntries((currentEntries) => {
      const existingIndex = currentEntries.findIndex((entry) => entry.id === savedEntry.id);
      const nextEntries =
        existingIndex >= 0
          ? currentEntries.map((entry, index) => (index === existingIndex ? savedEntry : entry))
          : [...currentEntries, savedEntry];
      cacheEntries(nextEntries);
      return nextEntries;
    });

    showToast(isUpdate ? "Song updated." : "Song saved.");
    setEditingEntry(null);
    setPrefillName("");
    setQuery(savedEntry.name);
    setActiveTab("search");
  }

  async function saveSong(form) {
    const songName = form.name.trim();
    const book = String(form.book || "Book 1").trim() || "Book 1";
    const page = form.page.trim();

    if (!songName || !page) {
      showToast("Song name and page number are required.");
      return;
    }

    if (backendEnabled) {
      if (!requireAdmin("save songs")) return;

      setAuthLoading(true);
      try {
        const savedEntry = form.id
          ? await updateSongInBackend(form.id, { ...form, name: songName, book, page })
          : await insertSongInBackend({ ...form, name: songName, book, page });
        finishSave(savedEntry, Boolean(form.id));
      } catch {
        showToast("Could not save to the shared backend.");
      } finally {
        setAuthLoading(false);
      }
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

  async function deleteEntry(entry) {
    if (!requireAdmin("delete songs")) return;

    const confirmed = confirm(`Delete "${entry.name}" from ${bookLabel(entry)}, page ${entry.page}?`);
    if (!confirmed) return;

    setAuthLoading(true);
    try {
      if (backendEnabled) {
        await deleteSongFromBackend(entry.id);
      }

      setEntries((currentEntries) => {
        const nextEntries = currentEntries.filter((currentEntry) => currentEntry.id !== entry.id);
        cacheEntries(nextEntries);
        return nextEntries;
      });
      showToast("Song deleted.");
    } catch {
      showToast("Could not delete from the shared backend.");
    } finally {
      setAuthLoading(false);
    }
  }

  function validatedAdminEmail() {
    const email = authEmail.trim().toLowerCase();
    if (!email) {
      showToast("Enter an admin email address.");
      return null;
    }

    const admin = adminForEmail(email);
    if (!admin) {
      showToast("That email is not in the admin list.");
      return null;
    }

    if (!supabase) {
      showToast("Backend is not configured yet.");
      return null;
    }

    return { admin, email };
  }

  async function requestAdminOtp() {
    const result = validatedAdminEmail();
    if (!result) return;

    setAuthLoading(true);
    try {
      const redirectTo = window.location.href.split(/[?#]/)[0];
      const { error } = await supabase.auth.signInWithOtp({
        email: result.email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
      });
      if (error) throw error;
      setAuthOtp("");
      setAuthStep("code");
      showToast(`OTP sent to ${result.admin.name}.`);
    } catch {
      showToast("Could not send the OTP code.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function verifyAdminOtp() {
    const result = validatedAdminEmail();
    if (!result) return;

    const token = authOtp.replace(/\D/g, "");
    if (token.length < 6 || token.length > 8) {
      showToast("Enter the OTP code from your email.");
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: result.email,
        token,
        type: "email"
      });
      if (error) throw error;
      setSession(data.session || null);
      setAuthOtp("");
      setAuthStep("email");
      showToast(`Signed in as ${result.admin.name}.`);
    } catch {
      showToast("That OTP code did not work.");
    } finally {
      setAuthLoading(false);
    }
  }

  function useAnotherAdminEmail() {
    setAuthOtp("");
    setAuthStep("email");
  }

  async function signOutAdmin() {
    if (!supabase) return;
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setAuthOtp("");
      setAuthStep("email");
      showToast("Signed out.");
    } catch {
      showToast("Could not sign out.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function refreshData() {
    if (backendEnabled) {
      const loaded = await loadBackendData(true);
      if (!loaded) await loadManagedData(false);
      return;
    }

    await loadManagedData(true);
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

        const confirmed = confirm(
          `Import ${cleaned.length} songs? This will replace the current local list.`
        );
        if (!confirmed) return;

        const nextDataVersion = Number(parsed.dataVersion || 0);
        setEntries(cleaned);
        setDataVersion(nextDataVersion);
        saveStoredSongs(cleaned, nextDataVersion);
        setQuery("");
        setActiveTab("search");
        showToast("Backup imported locally.");
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
      <Tabs activeTab={activeTab} canManage={canManage} onChange={setActiveTab} />
      {activeTab === "search" && (
        <SearchPanel
          canManage={canManage}
          entries={entries}
          matches={matches}
          onAddFirst={openAddPanel}
          onAddMissing={addMissingSong}
          onDelete={deleteEntry}
          onEdit={editEntry}
          query={query}
          setQuery={setQuery}
        />
      )}
      {activeTab === "add" && canManage && (
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
          adminProfile={adminProfile}
          authEmail={authEmail}
          authLoading={authLoading}
          authOtp={authOtp}
          authStep={authStep}
          backendEnabled={backendEnabled}
          dataStatus={dataStatus}
          importInputRef={importInputRef}
          onAuthEmailChange={setAuthEmail}
          onAuthOtpChange={setAuthOtp}
          onExportCsv={exportCsv}
          onExportJson={exportJson}
          onImportClick={() => importInputRef.current?.click()}
          onImportFile={importJsonFile}
          onRefreshData={refreshData}
          onRequestOtp={requestAdminOtp}
          onSignOut={signOutAdmin}
          onUseAnotherEmail={useAnotherAdminEmail}
          onVerifyOtp={verifyAdminOtp}
          userEmail={userEmail}
        />
      )}
      <Toast message={toastMessage} />
    </main>
  );
}

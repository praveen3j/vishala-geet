import EmptyState from "./EmptyState.jsx";
import SongCard from "./SongCard.jsx";
import { isPlaceholderEntry } from "../lib/songs.js";

export default function SearchPanel({
  canManage,
  entries,
  matches,
  onAddFirst,
  onAddMissing,
  onDelete,
  onEdit,
  query,
  setQuery
}) {
  const total = entries.length;
  const titleSearchable = entries.filter((entry) => !isPlaceholderEntry(entry)).length;
  const pageOnly = total - titleSearchable;

  const matchSummary = getMatchSummary({ matches, pageOnly, query, titleSearchable, total });

  return (
    <section id="searchPanel" className="panel is-active" aria-label="Search Songs">
      <div className="section">
        <div className="search-line">
          <div className="field is-compact">
            <label htmlFor="searchInput">Song name</label>
            <input
              id="searchInput"
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="Type or speak a song name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="summary">
          <span>{matchSummary}</span>
          <span>
            {total} {total === 1 ? "song" : "songs"}
          </span>
        </div>
      </div>
      <div className="results">
        {!total && (
          <EmptyState
            title="No songs loaded"
            text={
              canManage
                ? "Tap Add and enter the song name with its book and page number."
                : "Songs will appear here once the list is loaded."
            }
            actionText={canManage ? "Add Song" : ""}
            onAction={canManage ? onAddFirst : null}
          />
        )}
        {Boolean(total) && !matches.length && (
          <EmptyState
            title="No matching song"
            text={
              canManage
                ? "Try another spelling, or add this as a new song."
                : "Try another spelling or search by page number."
            }
            actionText={canManage ? "Add This Song" : ""}
            onAction={canManage ? onAddMissing : null}
          />
        )}
        {Boolean(matches.length) && (
          <div className="result-list">
            {matches.map((entry) => (
              <SongCard
                key={entry.id}
                canManage={canManage}
                entry={entry}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function getMatchSummary({ matches, pageOnly, query, titleSearchable, total }) {
  if (!total) return "No songs added yet.";
  if (query) return matches.length + " " + (matches.length === 1 ? "match" : "matches") + " found.";
  if (pageOnly) {
    return "Showing all songs. " + titleSearchable + " searchable by title, " + pageOnly + " page-only.";
  }
  return "Showing all songs.";
}

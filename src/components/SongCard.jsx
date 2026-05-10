import { bookLabel, songMeta } from "../lib/songs.js";

export default function SongCard({ canManage, entry, onDelete, onEdit }) {
  return (
    <article className="song-card">
      <div className="page-badge">
        <div>
          <span>{bookLabel(entry)}</span>
          <strong>{entry.page}</strong>
        </div>
      </div>
      <div className="song-main">
        <h3 className="song-title">{entry.name}</h3>
        <p className="page-line">
          {bookLabel(entry)}, Page {entry.page}
        </p>
        <p className="song-meta">{songMeta(entry)}</p>
        {canManage && (
          <div className="actions">
            <button className="mini-button" type="button" onClick={() => onEdit(entry)}>
              Edit
            </button>
            <button className="mini-button delete" type="button" onClick={() => onDelete(entry)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

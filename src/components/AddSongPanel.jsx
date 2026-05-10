import { useEffect, useState } from "react";
import { EMPTY_FORM } from "../constants.js";

export default function AddSongPanel({ editingEntry, isActive, onResetDraft, onSubmit, prefillName }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isActive) return;

    if (editingEntry) {
      setForm({
        id: editingEntry.id,
        name: editingEntry.name,
        book: editingEntry.book || "Book 1",
        page: editingEntry.page,
        aliases: editingEntry.aliases || "",
        notes: editingEntry.notes || ""
      });
      return;
    }

    setForm({ ...EMPTY_FORM, name: prefillName });
  }, [editingEntry, isActive, prefillName]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    onResetDraft();
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <section id="addPanel" className="panel is-active" aria-labelledby="formTitle">
      <form className="section" autoComplete="off" onSubmit={handleSubmit}>
        <h2 id="formTitle" className="form-title">
          {form.id ? "Edit Song" : "Add Song"}
        </h2>
        <div className="field">
          <label htmlFor="songName">New song name</label>
          <input
            id="songName"
            required
            placeholder="Example: Jai Jai Ram"
            autoComplete="off"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>
        <div className="two-up">
          <div className="field">
            <label htmlFor="bookName">Book</label>
            <input
              id="bookName"
              required
              placeholder="Example: Book 1"
              autoComplete="off"
              value={form.book}
              onChange={(event) => updateField("book", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="pageNumber">Page number</label>
            <input
              id="pageNumber"
              required
              placeholder="Example: 42"
              autoComplete="off"
              value={form.page}
              onChange={(event) => updateField("page", event.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="alternateNames">Other names</label>
          <input
            id="alternateNames"
            placeholder="Optional: spelling variations or first line"
            value={form.aliases}
            onChange={(event) => updateField("aliases", event.target.value)}
          />
          <small>Use this if people remember the same song by another name.</small>
        </div>
        <div className="field">
          <label htmlFor="songNotes">Notes</label>
          <textarea
            id="songNotes"
            placeholder="Optional"
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </div>
        <div className="actions">
          <button className="primary" type="submit">
            Save Song
          </button>
          <button className="secondary" type="button" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

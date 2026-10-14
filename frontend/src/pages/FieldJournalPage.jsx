import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowDownWideNarrow,
  Bug,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardPenLine,
  CloudSun,
  Droplets,
  Leaf,
  LoaderCircle,
  NotebookPen,
  Plus,
  Search,
  Sprout,
  Trash2,
} from "lucide-react";
import Footer from "../components/Footer";
import { API_URL } from "../services/api.js";

const STORAGE_PREFIX = "croppilot:field-journal:";
const NOTE_TYPES = [
  { id: "field-check", label: "Field check", icon: Sprout },
  { id: "pest-watch", label: "Pest watch", icon: Bug },
  { id: "watering", label: "Watering", icon: Droplets },
  { id: "weather", label: "Weather", icon: CloudSun },
  { id: "growth", label: "Growth", icon: Leaf },
];

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function readNotes(accountId) {
  const saved = localStorage.getItem(`${STORAGE_PREFIX}${accountId}`);
  if (!saved) return [];
  const notes = JSON.parse(saved);
  if (!Array.isArray(notes)) throw new Error("Your saved field notes could not be read.");
  return notes;
}

const blankForm = () => ({
  title: "",
  crop: "",
  plot: "",
  type: "field-check",
  observedAt: localDateValue(),
  nextCheckAt: "",
  details: "",
});

export default function FieldJournalPage() {
  const [token] = useState(() => localStorage.getItem("token") || "");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(() => Boolean(token));
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(() => token ? "" : "Sign in to open your field journal.");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      return () => { cancelled = true; };
    }

    axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (cancelled) return;
        const id = response.data.id;
        if (!id) throw new Error("Your account could not be identified.");
        setNotes(readNotes(id));
        setAccountId(id);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Could not load your field journal. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const upcomingCount = useMemo(() => {
    const today = localDateValue();
    return notes.filter((note) => !note.completed && note.nextCheckAt >= today).length;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes
      .filter((note) => activeFilter === "all" || note.type === activeFilter)
      .filter((note) => !normalizedQuery || [
        note.title, note.crop, note.plot, note.details,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery)))
      .sort((a, b) => b.observedAt.localeCompare(a.observedAt) || b.createdAt.localeCompare(a.createdAt));
  }, [activeFilter, notes, query]);

  function persistNotes(updatedNotes, successText) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${accountId}`, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      setError("");
      setSavedMessage(successText);
      window.setTimeout(() => setSavedMessage(""), 2500);
      return true;
    } catch (storageError) {
      setError(`Could not save this note in your browser: ${storageError.message}`);
      return false;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!accountId) return;
    const note = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    if (persistNotes([note, ...notes], "Observation added to your journal.")) {
      setForm(blankForm());
      setShowForm(false);
    }
  }

  function toggleCompleted(noteId) {
    persistNotes(
      notes.map((note) => note.id === noteId ? { ...note, completed: !note.completed } : note),
      "Follow-up status updated.",
    );
  }

  function removeNote(noteId) {
    persistNotes(notes.filter((note) => note.id !== noteId), "Observation removed.");
  }

  return (
    <div className="field-journal-page">
      <section className="field-journal-hero">
        <div className="field-journal-hero-copy">
          <div className="field-journal-kicker"><span /> YOUR FIELD, YOUR NOTES</div>
          <h1>Keep an eye<br /><em>on the little things.</em></h1>
          <p>Capture what you notice between scans. A quick note today can make tomorrow’s decisions clearer.</p>
          <button type="button" className="journal-add-button" onClick={() => setShowForm(true)}>
            <Plus size={17} /> Add an observation
          </button>
        </div>
        <div className="field-journal-stats" aria-label="Journal summary">
          <div className="journal-stamp"><NotebookPen size={21} /><span>FIELD<br />LOG / 01</span></div>
          <div className="journal-stat"><strong>{notes.length}</strong><span>observations<br />recorded</span></div>
          <div className="journal-stat"><strong>{upcomingCount}</strong><span>follow-ups<br />on your radar</span></div>
          <div className="journal-orbit" aria-hidden="true"><span /><span /><span /></div>
          <p>NOTICE · RECORD · RETURN</p>
        </div>
      </section>

      <section className="journal-workbench" aria-label="Field journal">
        <div className="journal-section-heading">
          <div>
            <span className="eyebrow">Your field notebook</span>
            <h2>Observations</h2>
          </div>
          <div className="journal-sort-label"><ArrowDownWideNarrow size={15} /> Newest first</div>
        </div>

        {showForm && (
          <form className="journal-form" onSubmit={handleSubmit}>
            <div className="journal-form-heading">
              <div><span className="eyebrow">A moment worth remembering</span><h3>New observation</h3></div>
              <button type="button" className="journal-close-button" onClick={() => setShowForm(false)} aria-label="Close form">×</button>
            </div>
            <div className="journal-form-grid">
              <label className="journal-field journal-field-wide">What did you notice?
                <input autoFocus required maxLength={80} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. New leaves appearing on east row" />
              </label>
              <label className="journal-field">Crop
                <input maxLength={50} value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} placeholder="e.g. Tomato" />
              </label>
              <label className="journal-field">Field or plot
                <input maxLength={50} value={form.plot} onChange={(event) => setForm({ ...form, plot: event.target.value })} placeholder="e.g. North bed" />
              </label>
              <label className="journal-field">Observation type
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                  {NOTE_TYPES.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
              <label className="journal-field">Observed on
                <input type="date" required max={localDateValue()} value={form.observedAt} onChange={(event) => setForm({ ...form, observedAt: event.target.value })} />
              </label>
              <label className="journal-field">Remind me to check again
                <input type="date" min={localDateValue()} value={form.nextCheckAt} onChange={(event) => setForm({ ...form, nextCheckAt: event.target.value })} />
              </label>
              <label className="journal-field journal-field-wide">Details
                <textarea required rows="3" maxLength={500} value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="What changed? Where did you see it? What might you want to check next time?" />
                <span className="journal-character-count">{form.details.length}/500</span>
              </label>
            </div>
            <div className="journal-form-actions">
              <button type="button" className="journal-cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="journal-save-button"><ClipboardPenLine size={16} /> Save observation</button>
            </div>
          </form>
        )}

        {savedMessage && <p className="journal-saved-message" role="status"><Check size={15} /> {savedMessage}</p>}
        {error && <p className="journal-error-message" role="alert">{error}</p>}

        <div className="journal-controls">
          <div className="journal-filter-list" aria-label="Filter observations">
            {[{ id: "all", label: "All notes" }, ...NOTE_TYPES].map(({ id, label }) => (
              <button key={id} type="button" className={activeFilter === id ? "journal-filter active" : "journal-filter"} onClick={() => setActiveFilter(id)} aria-pressed={activeFilter === id}>{label}</button>
            ))}
          </div>
          <label className="journal-search"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your notes" aria-label="Search your notes" /></label>
        </div>

        {loading ? (
          <div className="journal-empty"><LoaderCircle className="animate-spin" size={24} /><p>Opening your field notebook…</p></div>
        ) : !error && filteredNotes.length === 0 ? (
          <div className="journal-empty">
            <div className="journal-empty-icon"><Sprout size={26} /></div>
            <h3>{notes.length ? "No notes match that search" : "A fresh page, ready for you"}</h3>
            <p>{notes.length ? "Try another crop, field, or observation type." : "Record a field check, a watering note, or something small you’d like to revisit."}</p>
            {!notes.length && <button type="button" className="journal-text-action" onClick={() => setShowForm(true)}>Write your first note <ChevronRight size={15} /></button>}
          </div>
        ) : (
          <div className="journal-note-grid">
            {filteredNotes.map((note) => {
              const type = NOTE_TYPES.find((item) => item.id === note.type) || NOTE_TYPES[0];
              const Icon = type.icon;
              return (
                <article className={`journal-note-card ${note.completed ? "journal-note-complete" : ""}`} key={note.id}>
                  <div className="journal-note-topline">
                    <span className="journal-note-type"><Icon size={14} /> {type.label}</span>
                    <button type="button" className="journal-delete-button" onClick={() => removeNote(note.id)} aria-label={`Delete note: ${note.title}`}><Trash2 size={15} /></button>
                  </div>
                  <h3>{note.title}</h3>
                  <p className="journal-note-meta">{[note.crop, note.plot].filter(Boolean).join(" · ") || "Field observation"} <span>—</span> {formatDate(note.observedAt)}</p>
                  <p className="journal-note-details">{note.details}</p>
                  {note.nextCheckAt && (
                    <button type="button" className="journal-follow-up" onClick={() => toggleCompleted(note.id)} aria-pressed={note.completed}>
                      <span className={note.completed ? "journal-check checked" : "journal-check"}>{note.completed && <Check size={12} />}</span>
                      <CalendarDays size={15} />
                      <span>{note.completed ? "Follow-up complete" : "Check again"}<strong>{formatDate(note.nextCheckAt)}</strong></span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="journal-local-notice"><NotebookPen size={15} /> Notes are saved privately in this browser for your signed-in account.</div>
      <Footer />
    </div>
  );
}

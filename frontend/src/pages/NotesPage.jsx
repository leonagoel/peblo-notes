import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../hooks/useNotes';
import NoteCard from '../components/NoteCard';
import toast from 'react-hot-toast';
import '../styles/NotesPage.css';

const TAG_PALETTES = [
  { bg: 'rgba(124,90,247,0.15)', color: '#a68eff' },
  { bg: 'rgba(26,212,160,0.12)', color: '#1ad4a0' },
  { bg: 'rgba(240,168,48,0.12)', color: '#f0a830' },
  { bg: 'rgba(240,64,96,0.12)',  color: '#f04060' },
  { bg: 'rgba(48,192,240,0.12)', color: '#30c0f0' },
];
const tagColor = (tag) => TAG_PALETTES[tag.charCodeAt(0) % TAG_PALETTES.length];

export default function NotesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notes, loading, fetchNotes, createNote } = useNotes();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated');
  const [activeTag, setActiveTag] = useState(null);
  const [creating, setCreating] = useState(false);

  const category = searchParams.get('category') || '';

  const load = useCallback(() => {
    const params = { archived: false };
    if (search) params.q = search;
    if (activeTag) params.tag = activeTag;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    fetchNotes(params);
  }, [search, activeTag, category, sort, fetchNotes]);

  useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    setCreating(true);
    try {
      const note = await createNote({ title: '', body: '', tags: [], category: category || '' });
      if (note) navigate(`/notes/${note.id}`);
    } finally {
      setCreating(false);
    }
  };

  // Collect all tags from current notes
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))].slice(0, 10);

  const CAT_LABELS = { work: '💼 Work', personal: '🏡 Personal', learning: '📚 Learning', ideas: '💡 Ideas', meetings: '🤝 Meetings' };

  return (
    <div className="notes-page">
      {/* Top bar */}
      <div className="notes-topbar">
        <div className="notes-topbar-left">
          <h1 className="notes-heading">
            {category ? CAT_LABELS[category] || category : 'All Notes'}
          </h1>
          <span className="notes-count">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="notes-topbar-right">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="search-clear" onClick={() => setSearch('')}>×</button>}
          </div>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="updated">Recently updated</option>
            <option value="created">Date created</option>
            <option value="alpha">A → Z</option>
          </select>
          <motion.button
            className="btn-primary"
            onClick={handleNew}
            disabled={creating}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {creating ? <span className="spinner" /> : '＋'} New Note
          </motion.button>
        </div>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="tag-filter-row">
          <button
            className={`tag-pill ${!activeTag ? 'active' : ''}`}
            onClick={() => setActiveTag(null)}
          >All</button>
          {allTags.map(t => {
            const c = tagColor(t);
            return (
              <button
                key={t}
                className={`tag-pill ${activeTag === t ? 'active' : ''}`}
                style={activeTag === t ? { background: c.bg, color: c.color, borderColor: c.color } : {}}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
              >#{t}</button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="notes-loading">
          {[...Array(6)].map((_, i) => <div key={i} className="note-skeleton" />)}
        </div>
      ) : notes.length === 0 ? (
        <motion.div
          className="notes-empty"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-graphic">
            <div className="empty-orb" />
            <span className="empty-icon">📭</span>
          </div>
          <h3>No notes yet</h3>
          <p>{search ? 'Try a different search term' : 'Create your first note to get started'}</p>
          {!search && (
            <button className="btn-primary" onClick={handleNew} style={{ marginTop: 16 }}>
              ＋ Create Note
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div className="notes-grid" layout>
          <AnimatePresence>
            {notes.map((note, i) => (
              <NoteCard
                key={note.id}
                note={note}
                index={i}
                onClick={() => navigate(`/notes/${note.id}`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

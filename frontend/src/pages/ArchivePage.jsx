import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotes } from '../hooks/useNotes';
import { notesAPI } from '../lib/api';
import NoteCard from '../components/NoteCard';
import toast from 'react-hot-toast';
import '../styles/NotesPage.css';

export default function ArchivePage() {
  const navigate = useNavigate();
  const { notes, loading, fetchNotes, updateNote } = useNotes();

  useEffect(() => { fetchNotes({ archived: true }); }, []);

  const handleRestore = async (e, id) => {
    e.stopPropagation();
    await updateNote(id, { archived: false });
    await fetchNotes({ archived: true });
    toast.success('Note restored!');
  };

  return (
    <div className="notes-page">
      <div className="notes-topbar">
        <div className="notes-topbar-left">
          <h1 className="notes-heading">📦 Archive</h1>
          <span className="notes-count">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? (
        <div className="notes-loading">
          {[...Array(4)].map((_, i) => <div key={i} className="note-skeleton" />)}
        </div>
      ) : notes.length === 0 ? (
        <motion.div className="notes-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="empty-graphic">
            <div className="empty-orb" />
            <span className="empty-icon">📭</span>
          </div>
          <h3>Archive is empty</h3>
          <p>Notes you archive will appear here</p>
        </motion.div>
      ) : (
        <div className="notes-grid">
          {notes.map((note, i) => (
            <div key={note.id} style={{ position: 'relative' }}>
              <NoteCard note={note} index={i} onClick={() => navigate(`/notes/${note.id}`)} />
              <button
                className="btn-success btn-sm"
                style={{ position: 'absolute', top: 10, right: 10, fontSize: 10 }}
                onClick={(e) => handleRestore(e, note.id)}
              >
                ♻ Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notesAPI } from '../lib/api';
import { useNotes } from '../hooks/useNotes';
import toast from 'react-hot-toast';
import '../styles/EditorPage.css';

const TAG_PALETTES = [
  { bg: 'rgba(124,90,247,0.15)', color: '#a68eff' },
  { bg: 'rgba(26,212,160,0.12)', color: '#1ad4a0' },
  { bg: 'rgba(240,168,48,0.12)', color: '#f0a830' },
  { bg: 'rgba(240,64,96,0.12)',  color: '#f04060' },
  { bg: 'rgba(48,192,240,0.12)', color: '#30c0f0' },
];
const tagColor = (tag) => TAG_PALETTES[tag.charCodeAt(0) % TAG_PALETTES.length];

const CAT_OPTIONS = [
  { value: '', label: '— No category —' },
  { value: 'work', label: '💼 Work' },
  { value: 'personal', label: '🏡 Personal' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'ideas', label: '💡 Ideas' },
  { value: 'meetings', label: '🤝 Meetings' },
];

const AIPanel = ({ noteId, note, onNoteRefresh }) => {
  const [loading, setLoading] = useState(null); // 'summary'|'actions'|'title'
  const [result, setResult] = useState(null);

  const run = async (type) => {
    setLoading(type);
    setResult(null);
    try {
      const apiCalls = { summary: notesAPI.generateSummary, actions: notesAPI.generateActions, title: notesAPI.generateTitle };
      const res = await apiCalls[type](noteId);
      setResult({ type, data: res.data });
      await onNoteRefresh();
      toast.success(`AI ${type} generated!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span className="ai-panel-icon">✦</span>
        <span className="ai-panel-title">AI Assistant</span>
      </div>

      <div className="ai-actions">
        {[
          { type: 'summary', icon: '📝', label: 'Summarise Note' },
          { type: 'actions', icon: '✅', label: 'Extract Actions' },
          { type: 'title', icon: '💡', label: 'Suggest Title' },
        ].map(a => (
          <motion.button
            key={a.type}
            className="ai-action-btn"
            onClick={() => run(a.type)}
            disabled={loading !== null}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading === a.type ? <span className="spinner" style={{ width: 12, height: 12 }} /> : a.icon}
            {a.label}
            <span className="ai-action-arrow">→</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(result || note?.summary || note?.actionItems?.length > 0) && (
          <motion.div
            className="ai-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {note?.summary && (
              <div className="ai-result-block">
                <div className="air-label">Summary</div>
                <p className="air-text">{note.summary}</p>
              </div>
            )}
            {note?.actionItems?.length > 0 && (
              <div className="ai-result-block">
                <div className="air-label">Action Items</div>
                <ul className="air-actions">
                  {note.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {note?.suggestedTitle && (
              <div className="ai-result-block">
                <div className="air-label">Suggested Title</div>
                <div className="air-suggested-title">{note.suggestedTitle}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateNote, deleteNote, scheduleAutoSave, saveStatus } = useNotes();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loadingNote, setLoadingNote] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const autoSaveTimer = useRef(null);
  const [localSaveStatus, setLocalSaveStatus] = useState('saved');

  const loadNote = useCallback(async () => {
    try {
      const res = await notesAPI.get(id);
      const n = res.data.note;
      setNote(n);
      setTitle(n.title || '');
      setBody(n.body || '');
      setTags(n.tags || []);
      setCategory(n.category || '');
    } catch {
      toast.error('Note not found');
      navigate('/');
    } finally {
      setLoadingNote(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadNote(); }, [loadNote]);

  const triggerAutoSave = useCallback((newTitle, newBody, newTags, newCat) => {
    setLocalSaveStatus('unsaved');
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setLocalSaveStatus('saving');
      await updateNote(id, { title: newTitle, body: newBody, tags: newTags, category: newCat });
      setLocalSaveStatus('saved');
    }, 1200);
  }, [id, updateNote]);

  const handleTitleChange = (v) => { setTitle(v); triggerAutoSave(v, body, tags, category); };
  const handleBodyChange = (v) => { setBody(v); triggerAutoSave(title, v, tags, category); };
  const handleCatChange = (v) => { setCategory(v); triggerAutoSave(title, body, tags, v); };

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean || tags.includes(clean)) return;
    const newTags = [...tags, clean];
    setTags(newTags);
    triggerAutoSave(title, body, newTags, category);
  };
  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    triggerAutoSave(title, body, newTags, category);
  };
  const handleTagKeydown = (e) => {
    if (['Enter', ',', ' '].includes(e.key)) {
      e.preventDefault();
      if (tagInput.trim()) { addTag(tagInput); setTagInput(''); }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this note?')) return;
    await deleteNote(id);
    navigate('/');
  };

  const handleArchive = async () => {
    await updateNote(id, { archived: !note.archived });
    toast.success(note.archived ? 'Note restored' : 'Note archived');
    navigate('/');
  };

  const handleTogglePublic = async () => {
    const res = await notesAPI.update(id, { isPublic: !note.isPublic });
    setNote(res.data.note);
    toast.success(res.data.note.isPublic ? 'Note is now public' : 'Note is now private');
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/shared/${note.shareId}`;
    navigator.clipboard.writeText(link).then(() => toast.success('Link copied!')).catch(() => toast.error('Copy failed'));
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  if (loadingNote) return (
    <div className="editor-loading">
      <div className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  );

  return (
    <div className="editor-layout">
      {/* Main editor */}
      <div className="editor-main">
        {/* Toolbar */}
        <div className="editor-toolbar">
          <button className="btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Back
          </button>
          <div className="editor-save-status">
            {localSaveStatus === 'saving' && <><span className="spinner" style={{ width: 12, height: 12 }} /> Saving…</>}
            {localSaveStatus === 'saved' && <><span className="save-dot" />Saved</>}
            {localSaveStatus === 'unsaved' && <><span className="save-dot unsaved" />Unsaved</>}
          </div>
          <div className="editor-toolbar-actions">
            <button className="btn-ghost btn-sm" onClick={handleArchive} title={note?.archived ? 'Restore' : 'Archive'}>
              {note?.archived ? '♻ Restore' : '📦 Archive'}
            </button>
            <button className="btn-ghost btn-sm" onClick={() => setShowShareModal(true)}>
              🔗 Share
            </button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>
              🗑 Delete
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="editor-title-wrap">
          <textarea
            className="editor-title-input"
            placeholder="Untitled Note"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            rows={1}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />
        </div>

        {/* Body */}
        <div className="editor-body-wrap">
          <textarea
            className="editor-body-input"
            placeholder="Start writing… your thoughts, ideas, and plans belong here."
            value={body}
            onChange={e => handleBodyChange(e.target.value)}
          />
        </div>

        <div className="editor-meta-bar">
          <span className="editor-wordcount">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
          {note?.updatedAt && (
            <span className="editor-timestamp">
              Updated {new Date(note.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="editor-sidebar">
        {/* Category */}
        <div className="es-section">
          <div className="es-label">Category</div>
          <select className="es-select" value={category} onChange={e => handleCatChange(e.target.value)}>
            {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div className="es-section">
          <div className="es-label">Tags</div>
          <div className="tags-input-wrap" onClick={() => document.getElementById('tag-input').focus()}>
            {tags.map(t => {
              const c = tagColor(t);
              return (
                <span key={t} className="tag-chip" style={{ background: c.bg, color: c.color }}>
                  #{t}
                  <button className="tag-chip-rm" onClick={e => { e.stopPropagation(); removeTag(t); }}>×</button>
                </span>
              );
            })}
            <input
              id="tag-input"
              className="tag-bare-input"
              placeholder={tags.length === 0 ? 'Add tags…' : ''}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeydown}
            />
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--faint)', marginTop: 5 }}>Press Enter or Space to add</p>
        </div>

        {/* Note info */}
        <div className="es-section">
          <div className="es-label">Note Details</div>
          <div className="note-meta-list">
            <div className="nml-row"><span>Share ID</span><span className="font-mono" style={{ fontSize: 10 }}>{note?.shareId}</span></div>
            <div className="nml-row"><span>Visibility</span>
              <button
                className={`btn-sm ${note?.isPublic ? 'btn-success' : 'btn-ghost'}`}
                style={{ fontSize: 11 }}
                onClick={handleTogglePublic}
              >{note?.isPublic ? '🌐 Public' : '🔒 Private'}</button>
            </div>
            <div className="nml-row"><span>AI calls</span><span>{note?.aiCallCount || 0}</span></div>
            <div className="nml-row"><span>Created</span><span>{note?.createdAt ? new Date(note.createdAt).toLocaleDateString() : '—'}</span></div>
          </div>
        </div>

        {/* AI Panel */}
        <AIPanel noteId={id} note={note} onNoteRefresh={loadNote} />
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: 8 }}>🔗 Share Note</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
                Make this note public so anyone with the link can read it.
              </p>
              <div className="share-status-row">
                <div className={`share-indicator ${note?.isPublic ? 'public' : 'private'}`} />
                <span style={{ fontSize: 13 }}>{note?.isPublic ? 'This note is public' : 'This note is private'}</span>
                <button className={`btn-sm ${note?.isPublic ? 'btn-danger' : 'btn-success'}`} onClick={handleTogglePublic}>
                  {note?.isPublic ? 'Make Private' : 'Make Public'}
                </button>
              </div>
              {note?.isPublic && (
                <div className="share-link-box">
                  <span className="share-link-text">{`${window.location.origin}/shared/${note.shareId}`}</span>
                  <button className="btn-primary btn-sm" onClick={copyShareLink}>Copy</button>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn-ghost" onClick={() => setShowShareModal(false)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

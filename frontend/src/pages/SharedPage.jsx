import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sharedAPI } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import '../styles/SharedPage.css';

const TAG_PALETTES = [
  { bg: 'rgba(124,90,247,0.15)', color: '#a68eff' },
  { bg: 'rgba(26,212,160,0.12)', color: '#1ad4a0' },
  { bg: 'rgba(240,168,48,0.12)', color: '#f0a830' },
  { bg: 'rgba(240,64,96,0.12)',  color: '#f04060' },
  { bg: 'rgba(48,192,240,0.12)', color: '#30c0f0' },
];
const tagColor = (tag) => TAG_PALETTES[tag.charCodeAt(0) % TAG_PALETTES.length];
const CAT_ICON = { work:'💼', personal:'🏡', learning:'📚', ideas:'💡', meetings:'🤝' };

export default function SharedPage() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    sharedAPI.get(shareId)
      .then(res => setNote(res.data.note))
      .catch(err => setError(err.response?.data?.error || 'Note not found'))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return (
    <div className="shared-loading">
      <div className="shared-spinner">
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <span>Loading note…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="shared-error">
      <div className="shared-error-inner">
        <div className="shared-error-icon">🔒</div>
        <h2>Note Not Found</h2>
        <p>{error}</p>
        <Link to="/login" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10 }}>
          Open Peblo Notes →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="shared-page dot-bg">
      <div className="shared-ambient-orb" />

      {/* Topbar */}
      <header className="shared-header">
        <div className="shared-brand">
          <div className="shared-brand-mark">P</div>
          <span className="shared-brand-name">peblo notes</span>
        </div>
        <span className="badge badge-green">🌐 Public Note</span>
      </header>

      {/* Note */}
      <motion.main
        className="shared-main"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="shared-note-card">
          {/* Title */}
          <h1 className="shared-title">{note.title || 'Untitled Note'}</h1>

          {/* Meta */}
          <div className="shared-meta">
            {note.authorName && (
              <span className="shared-author">By {note.authorName}</span>
            )}
            <span className="shared-time">
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
            {note.category && (
              <span className="shared-cat">{CAT_ICON[note.category] || '📄'} {note.category}</span>
            )}
          </div>

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="shared-tags">
              {note.tags.map(t => {
                const c = tagColor(t);
                return <span key={t} className="nc-tag" style={{ background: c.bg, color: c.color }}>#{t}</span>;
              })}
            </div>
          )}

          <div className="shared-divider" />

          {/* Body */}
          <div className="shared-body">
            {note.body ? note.body.split('\n').map((line, i) => (
              <p key={i} className={line === '' ? 'shared-spacer' : ''}>{line}</p>
            )) : <p className="text-faint" style={{ fontStyle: 'italic' }}>Empty note</p>}
          </div>

          {/* AI Summary */}
          {note.summary && (
            <motion.div
              className="shared-ai-block"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="shared-ai-label">✦ AI Summary</div>
              <p className="shared-ai-text">{note.summary}</p>
            </motion.div>
          )}

          {/* Action items */}
          {note.actionItems?.length > 0 && (
            <motion.div
              className="shared-ai-block shared-actions-block"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="shared-ai-label" style={{ color: 'var(--green)' }}>✅ Action Items</div>
              <ul className="shared-actions-list">
                {note.actionItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <div className="shared-cta">
          <p>Want to create your own AI-powered notes?</p>
          <Link to="/login">
            <button className="btn-primary">Try Peblo Notes →</button>
          </Link>
        </div>
      </motion.main>
    </div>
  );
}

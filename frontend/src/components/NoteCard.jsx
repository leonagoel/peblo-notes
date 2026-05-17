import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import '../styles/NoteCard.css';

const TAG_PALETTES = [
  { bg: 'rgba(124,90,247,0.15)', color: '#a68eff' },
  { bg: 'rgba(26,212,160,0.12)', color: '#1ad4a0' },
  { bg: 'rgba(240,168,48,0.12)', color: '#f0a830' },
  { bg: 'rgba(240,64,96,0.12)',  color: '#f04060' },
  { bg: 'rgba(48,192,240,0.12)', color: '#30c0f0' },
];

const CAT_ICON = { work:'💼', personal:'🏡', learning:'📚', ideas:'💡', meetings:'🤝' };

const tagColor = (tag) => TAG_PALETTES[tag.charCodeAt(0) % TAG_PALETTES.length];

export default function NoteCard({ note, onClick, index }) {
  const excerpt = note.body?.substring(0, 130) || '';
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

  return (
    <motion.div
      className="note-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="nc-shimmer" />
      <div className="nc-header">
        <div className="nc-title">{note.title || <span className="nc-untitled">Untitled</span>}</div>
        {note.category && <span className="nc-cat">{CAT_ICON[note.category] || '📄'}</span>}
      </div>

      {excerpt && (
        <p className="nc-excerpt">{excerpt}{note.body?.length > 130 ? '…' : ''}</p>
      )}

      <div className="nc-tags">
        {note.tags?.slice(0, 3).map(t => {
          const c = tagColor(t);
          return (
            <span key={t} className="nc-tag" style={{ background: c.bg, color: c.color }}>
              #{t}
            </span>
          );
        })}
        {note.tags?.length > 3 && <span className="nc-tag-more">+{note.tags.length - 3}</span>}
      </div>

      <div className="nc-footer">
        <span className="nc-time">{timeAgo}</span>
        <div className="nc-footer-right">
          {note.isPublic && <span className="badge badge-green" style={{ fontSize: 10 }}>🌐 Public</span>}
          {note.aiGenerated && <span className="nc-ai-badge">✨ AI</span>}
        </div>
      </div>
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { insightsAPI } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import '../styles/DashboardPage.css';

const CAT_ICON = { work:'💼', personal:'🏡', learning:'📚', ideas:'💡', meetings:'🤝' };

const TAG_COLORS = ['#7c5af7','#1ad4a0','#f0a830','#30c0f0','#f04060','#a68eff','#ffd166','#06d6a0'];

const StatCard = ({ icon, value, label, sub, color, delay }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    whileHover={{ y: -3 }}
  >
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </motion.div>
);

const BarChart = ({ data, maxVal, color }) => (
  <div className="bar-chart">
    {data.map((item, i) => (
      <div key={i} className="bar-item">
        <div className="bar-track">
          <motion.div
            className="bar-fill"
            style={{ background: color || 'var(--violet)' }}
            initial={{ width: 0 }}
            animate={{ width: `${maxVal > 0 ? (item.count / maxVal) * 100 : 0}%` }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.4,0,0.2,1] }}
          />
        </div>
        <span className="bar-label">{item.label}</span>
        <span className="bar-count">{item.count}</span>
      </div>
    ))}
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    insightsAPI.get()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="dash-loading">
      <div className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  );

  const t = data?.totals || {};
  const tags = data?.topTags || [];
  const recent = data?.recentNotes || [];
  const aiUsage = data?.aiUsage || [];
  const weekly = data?.weeklyActivity || [];

  const aiMap = {};
  aiUsage.forEach(a => { aiMap[a.action_type] = parseInt(a.count); });

  // Build weekly bar data — fill 7 days
  const days7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const found = weekly.find(w => w.day?.slice(0, 10) === iso);
    days7.push({ label: d.toLocaleDateString('en', { weekday: 'short' }), count: found ? parseInt(found.count) : 0 });
  }
  const maxWeek = Math.max(...days7.map(d => d.count), 1);
  const maxTag = tags.length ? parseInt(tags[0].count) : 1;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">Your workspace at a glance</p>
        </div>
        <motion.button
          className="btn-primary"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.03 }}
        >＋ New Note</motion.button>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard icon="📝" value={t.total_notes || 0} label="Total Notes" sub="Active workspace" color="var(--violet-light)" delay={0.05} />
        <StatCard icon="✦" value={t.ai_notes || 0} label="AI-Enhanced" sub="Notes with AI content" color="var(--green)" delay={0.1} />
        <StatCard icon="🌐" value={t.public_notes || 0} label="Public Notes" sub="Shared with world" color="var(--amber)" delay={0.15} />
        <StatCard icon="📦" value={t.archived_notes || 0} label="Archived" sub="Stored away" color="var(--faint)" delay={0.2} />
      </div>

      {/* Charts row */}
      <div className="dash-row-2">
        {/* Weekly activity */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="dash-card-header">
            <h3>📅 Weekly Activity</h3>
            <span className="dash-card-sub">Notes edited this week</span>
          </div>
          <BarChart data={days7} maxVal={maxWeek} color="var(--violet)" />
        </motion.div>

        {/* Top tags */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="dash-card-header">
            <h3>🏷️ Most Used Tags</h3>
            <span className="dash-card-sub">Top {tags.length} tags</span>
          </div>
          {tags.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>No tags yet</p>
          ) : (
            <div className="tag-bar-chart">
              {tags.map((t, i) => (
                <div key={t.tag} className="tag-bar-row">
                  <span className="tbr-name">#{t.tag}</span>
                  <div className="tbr-track">
                    <motion.div
                      className="tbr-fill"
                      style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(parseInt(t.count) / maxTag) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.3 + i * 0.07 }}
                    />
                  </div>
                  <span className="tbr-count">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="dash-row-2">
        {/* Recent notes */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="dash-card-header">
            <h3>🕒 Recently Edited</h3>
          </div>
          {recent.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>No notes yet</p>
          ) : (
            <div className="recent-list">
              {recent.map((n, i) => (
                <motion.div
                  key={n.id}
                  className="recent-item"
                  onClick={() => navigate(`/notes/${n.id}`)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <span className="ri-icon">{CAT_ICON[n.category] || '📄'}</span>
                  <span className="ri-title">{n.title || 'Untitled'}</span>
                  <span className="ri-time">{formatDistanceToNow(new Date(n.updated_at), { addSuffix: true })}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI usage */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="dash-card-header">
            <h3>✦ AI Usage Stats</h3>
            <span className="dash-card-sub">Lifetime usage</span>
          </div>
          <div className="ai-usage-grid">
            {[
              { type: 'summary', icon: '📝', label: 'Summaries', color: 'var(--violet-light)' },
              { type: 'actions', icon: '✅', label: 'Action Lists', color: 'var(--green)' },
              { type: 'title', icon: '💡', label: 'Titles', color: 'var(--amber)' },
            ].map(a => (
              <div key={a.type} className="ai-usage-card" style={{ borderColor: a.color + '30' }}>
                <div className="auc-icon">{a.icon}</div>
                <div className="auc-val" style={{ color: a.color }}>{aiMap[a.type] || 0}</div>
                <div className="auc-label">{a.label}</div>
              </div>
            ))}
            <div className="ai-usage-card ai-usage-total">
              <div className="auc-icon">⚡</div>
              <div className="auc-val" style={{ color: 'var(--text)' }}>
                {Object.values(aiMap).reduce((s, v) => s + v, 0)}
              </div>
              <div className="auc-label">Total Calls</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

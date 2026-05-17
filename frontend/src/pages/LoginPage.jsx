import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/Login.css';

const OrbitRing = ({ size, duration, delay, opacity }) => (
  <motion.div
    className="orbit-ring"
    style={{ width: size, height: size, opacity }}
    animate={{ rotate: 360 }}
    transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
  />
);

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    if (mode === 'signup' && !form.name) return toast.error('Enter your name');
    if (form.password.length < 8) return toast.error('Password must be 8+ characters');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page dot-bg">
      {/* Ambient orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="orbit-system">
        <OrbitRing size={300} duration={20} delay={0} opacity={0.15} />
        <OrbitRing size={480} duration={35} delay={-10} opacity={0.08} />
        <OrbitRing size={660} duration={55} delay={-5} opacity={0.05} />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Logo */}
        <div className="login-logo">
          <motion.div className="login-logo-mark" whileHover={{ rotate: 8, scale: 1.08 }}>
            <span>P</span>
          </motion.div>
          <div>
            <div className="login-logo-name">peblo</div>
            <div className="login-logo-tagline">AI Notes Workspace</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="auth-tab">
          {['login', 'signup'].map(m => (
            <motion.button
              key={m}
              className={`auth-tab-btn ${mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
              whileTap={{ scale: 0.97 }}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <label className="form-label">Full Name</label>
                <input
                  placeholder="Ada Lovelace"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="hello@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>
          <motion.button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 8 }}
          >
            {loading ? <><span className="spinner" /> Working…</> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
          </motion.button>
        </form>

        <p className="login-hint">
          Demo: use any email & password (8+ chars)
        </p>
      </motion.div>
    </div>
  );
}

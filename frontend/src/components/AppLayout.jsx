import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useNotes } from '../hooks/useNotes';
import '../styles/AppLayout.css';

export default function AppLayout() {
  const { notes, fetchNotes } = useNotes();

  useEffect(() => { fetchNotes({ archived: false }); }, []);

  return (
    <div className="app-layout">
      <Sidebar noteCount={notes.filter(n => !n.archived).length} />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}

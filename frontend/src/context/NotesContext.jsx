import React, { createContext, useContext } from 'react';
import { useNotes } from '../hooks/useNotes';

const NotesContext = createContext(null);

export const NotesProvider = ({ children }) => {
  const notes = useNotes();
  return <NotesContext.Provider value={notes}>{children}</NotesContext.Provider>;
};

export const useNotesContext = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotesContext must be inside NotesProvider');
  return ctx;
};

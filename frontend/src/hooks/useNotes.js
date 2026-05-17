import { useState, useCallback, useRef } from 'react';
import { notesAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const autoSaveTimer = useRef(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'

  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await notesAPI.list(params);
      setNotes(res.data.notes);
      return res.data.notes;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (data = {}) => {
    try {
      const res = await notesAPI.create(data);
      const note = res.data.note;
      setNotes(prev => [note, ...prev]);
      setCurrentNote(note);
      return note;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create note');
    }
  }, []);

  const updateNote = useCallback(async (id, data) => {
    try {
      const res = await notesAPI.update(id, data);
      const updated = res.data.note;
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      if (currentNote?.id === id) setCurrentNote(updated);
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save note');
    }
  }, [currentNote]);

  const deleteNote = useCallback(async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (currentNote?.id === id) setCurrentNote(null);
      toast.success('Note deleted');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete note');
    }
  }, [currentNote]);

  const scheduleAutoSave = useCallback((id, data) => {
    setSaveStatus('unsaved');
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      await updateNote(id, data);
      setSaveStatus('saved');
    }, 1200);
  }, [updateNote]);

  const generateAI = useCallback(async (type, noteId) => {
    const actions = { summary: notesAPI.generateSummary, actions: notesAPI.generateActions, title: notesAPI.generateTitle };
    try {
      const res = await actions[type](noteId);
      // Refresh current note
      const noteRes = await notesAPI.get(noteId);
      const updated = noteRes.data.note;
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
      setCurrentNote(updated);
      return { data: res.data, note: updated };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'AI generation failed');
    }
  }, []);

  return { notes, loading, currentNote, setCurrentNote, saveStatus, fetchNotes, createNote, updateNote, deleteNote, scheduleAutoSave, generateAI };
};

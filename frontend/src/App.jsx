import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import EditorPage from './pages/EditorPage';
import DashboardPage from './pages/DashboardPage';
import ArchivePage from './pages/ArchivePage';
import SharedPage from './pages/SharedPage';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--panel)',
              color: 'var(--text)',
              border: '1px solid var(--rim2)',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
            },
            success: { iconTheme: { primary: '#1ad4a0', secondary: '#0d0d18' } },
            error: { iconTheme: { primary: '#f04060', secondary: '#0d0d18' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shared/:shareId" element={<SharedPage />} />

          {/* Protected app routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <NotesProvider>
                  <AppLayout />
                </NotesProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<NotesPage />} />
            <Route path="notes/:id" element={<EditorPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="archive" element={<ArchivePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

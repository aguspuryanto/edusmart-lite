import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import UsersPage from './pages/UsersPage';
import Materials from './pages/Materials';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import Chat from './pages/Chat';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';

import Discussion from './pages/Discussion';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute><Classes /></PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute><Subjects /></PrivateRoute>} />
          <Route path="/teachers" element={<PrivateRoute><UsersPage role="teacher" /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><UsersPage role="student" /></PrivateRoute>} />
          <Route path="/materials" element={<PrivateRoute><Materials /></PrivateRoute>} />
          <Route path="/exams" element={<PrivateRoute><Exams /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/announcements" element={<PrivateRoute><Announcements /></PrivateRoute>} />
          <Route path="/discussions" element={<PrivateRoute><Discussion /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

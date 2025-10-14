import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ChatbotProvider } from './context/ChatbotContext';
import Chatbot from './components/ui/Chatbot';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ElderDashboard from './components/Elder/ElderDashboard';
import CaregiverDashboard from './components/Caregiver/CaregiverDashboard';
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'elder' ? '/elder' : '/caregiver'} replace />;
  }

  return children;
};

// Main App Routes Component
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={user.role === 'elder' ? '/elder' : '/caregiver'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/elder"
        element={
          <ProtectedRoute role="elder">
            <ElderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/caregiver"
        element={
          <ProtectedRoute role="caregiver">
            <CaregiverDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <ChatbotProvider>
            <Router>
              <div className="App">
                <AppRoutes />
                <Chatbot />
              </div>
            </Router>
          </ChatbotProvider>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
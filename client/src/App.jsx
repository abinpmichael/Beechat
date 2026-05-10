import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SuperAdmin from './pages/SuperAdmin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ChatWidget from './widget/ChatWidget';
import { API_BASE_URL } from './config';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
       <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" className="w-16 h-16 animate-bounce" alt="Bee Chat" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing with Bee Hive...</p>
       </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  const [googleClientId, setGoogleClientId] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings.php`);
        setGoogleClientId(res.data.google_client_id);
      } catch (err) {
        console.error("Failed to load platform settings", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard/super-admin" element={<SuperAdmin />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/widget" element={<div className="h-screen overflow-hidden bg-transparent"><ChatWidget apiKey={new URLSearchParams(window.location.search).get('apiKey')} /></div>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;

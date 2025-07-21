import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Properties from './pages/Properties';
import Opportunities from './pages/Opportunities';
import Groups from './pages/Groups';
import Messenger from './pages/Messenger';
import Settings from './pages/Settings';
import Login from './pages/Login';
import RealtorDashboard from './pages/RealtorDashboard';
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import { supabase } from './supabaseClient';
import Typography from '@mui/material/Typography';

function App() {
  console.log('App component rendering...');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [messengerUnread, setMessengerUnread] = useState(0);

  useEffect(() => {
    console.log('App useEffect running...');
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session check result:', session ? 'User logged in' : 'No session');
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Supabase session error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'User logged in' : 'No session');
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('App render state:', { loading, user: user ? 'User exists' : 'No user' });
  
  if (loading) {
    console.log('Rendering loading screen...');
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'
      }}>
        <Typography variant="h6" color="primary.main">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    console.log('Rendering unauthenticated routes...');
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Get user role from metadata (determined during registration)
  const userRole = user.user_metadata?.role;
  const isBuilder = userRole === 'builder';
  console.log('User role:', userRole, 'Is builder:', isBuilder);

  // Handle logout with proper error handling
  const handleLogout = async () => {
    if (logoutLoading) return; // Prevent multiple clicks
    
    setLogoutLoading(true);
    try {
      console.log('Logging out user:', user.email);
      
      // First, try to get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found, clearing user state');
        setUser(null);
        return;
      }
      
      // Try to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        
        // If session is missing, just clear the user state
        if (error.message.includes('Auth session missing')) {
          console.log('Session missing, clearing user state');
          setUser(null);
        } else {
          alert('Error logging out: ' + error.message);
        }
      } else {
        console.log('Logout successful');
        setUser(null);
      }
    } catch (err) {
      console.error('Logout exception:', err);
      
      // If there's any exception, just clear the user state
      console.log('Exception during logout, clearing user state');
      setUser(null);
    } finally {
      setLogoutLoading(false);
    }
  };

  console.log('Rendering authenticated app...');
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <CssBaseline />
      <Sidebar user={user} onLogout={handleLogout} logoutLoading={logoutLoading} messengerUnread={messengerUnread} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          {isBuilder ? (
            <Route path="/dashboard" element={<RealtorDashboard user={user} />} />
          ) : (
            <Route path="/dashboard" element={<Dashboard user={user} />} />
          )}
          {/* Only show Profile route for seekers and admins, not builders */}
          {!isBuilder && <Route path="/profile" element={<Profile user={user} />} />}
          <Route path="/properties" element={<Properties user={user} />} />
          <Route path="/opportunities" element={<Opportunities user={user} />} />
          <Route path="/groups" element={<Groups user={user} />} />
          <Route path="/messenger" element={<Messenger user={user} setMessengerUnread={setMessengerUnread} />} />
          <Route path="/settings" element={<Settings user={user} />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;

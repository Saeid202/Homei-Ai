import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { supabase } from '../supabaseClient';

export default function DebugPanel({ user }) {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    testConnection();
    getSessionInfo();
  }, []);

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('Profile')
        .select('id')
        .limit(1);
      
      if (error) {
        setConnectionStatus('Error: ' + error.message);
      } else {
        setConnectionStatus('Connected successfully');
      }
    } catch (err) {
      setConnectionStatus('Exception: ' + err.message);
    }
  };

  const getSessionInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionInfo(session);
    } catch (err) {
      console.error('Error getting session:', err);
    }
  };

  const testLogout = async () => {
    try {
      console.log('Testing logout...');
      
      // Check if session exists
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('No active session found - user is already logged out');
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('Auth session missing')) {
          alert('Session missing - user will be logged out locally');
        } else {
          alert('Logout test error: ' + error.message);
        }
      } else {
        alert('Logout test successful');
      }
    } catch (err) {
      alert('Logout test exception: ' + err.message);
    }
  };

  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        alert('Session refresh error: ' + error.message);
      } else {
        alert('Session refreshed successfully');
        getSessionInfo(); // Update session info
      }
    } catch (err) {
      alert('Session refresh exception: ' + err.message);
    }
  };

  const forceLogout = () => {
    try {
      console.log('Force logout - clearing local storage');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      alert('Local storage cleared. Please refresh the page.');
    } catch (err) {
      alert('Force logout error: ' + err.message);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Debug Panel</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">Connection Status:</Typography>
        <Alert severity={connectionStatus.includes('Error') ? 'error' : 'success'} sx={{ mt: 1 }}>
          {connectionStatus}
        </Alert>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">User Info:</Typography>
        <Typography variant="body2">
          ID: {user?.id || 'None'}
        </Typography>
        <Typography variant="body2">
          Email: {user?.email || 'None'}
        </Typography>
        <Typography variant="body2">
          Role: {user?.user_metadata?.role || 'None'}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">Session Info:</Typography>
        <Typography variant="body2">
          Has Session: {sessionInfo ? 'Yes' : 'No'}
        </Typography>
        {sessionInfo && (
          <Typography variant="body2">
            Expires: {new Date(sessionInfo.expires_at * 1000).toLocaleString()}
          </Typography>
        )}
      </Box>

      <Button 
        variant="outlined" 
        size="small" 
        onClick={testLogout}
        sx={{ mr: 1 }}
      >
        Test Logout
      </Button>
      
      <Button 
        variant="outlined" 
        size="small" 
        onClick={refreshSession}
        sx={{ mr: 1 }}
      >
        Refresh Session
      </Button>
      
      <Button 
        variant="outlined" 
        size="small" 
        onClick={forceLogout}
        sx={{ mr: 1 }}
      >
        Force Logout
      </Button>
      
      <Button 
        variant="outlined" 
        size="small" 
        onClick={testConnection}
      >
        Test Connection
      </Button>
    </Paper>
  );
} 
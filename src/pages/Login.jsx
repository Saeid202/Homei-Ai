import { useState } from 'react';
import { Box, Button, Typography, TextField, Paper, Alert, Link } from '@mui/material';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the verification link before logging in.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        // Get user role from metadata (set during signup)
        const userRole = data.user.user_metadata?.role;
        
        if (!userRole) {
          setError('User role not found. Please contact support.');
          return;
        }

        // Verify user exists in appropriate table
        if (userRole === 'seeker') {
          const { data: seekerData, error: seekerError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .eq('user_role', 'seeker')
            .single();

          if (seekerError || !seekerData) {
            setError('Seeker account not found. Please contact support.');
            return;
          }
        }

        // Login successful - role is determined by registration, not login choice
        onLogin(data.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f9fafb',
      p: 2
    }}>
      <Paper elevation={0} sx={{ 
        p: { xs: 4, sm: 6 }, 
        minWidth: { xs: 320, sm: 420 }, 
        maxWidth: 480, 
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} mb={1} color="text.primary">
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your Homie AI account
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
            required
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 4 }}
            required
          />
          <Button 
            variant="contained" 
            fullWidth 
            type="submit"
            disabled={loading || !email || !password}
            size="large"
            sx={{ 
              py: 1.5, 
              fontWeight: 600, 
              fontSize: '1rem', 
              borderRadius: 2,
              mb: 3
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Don't have an account?{' '}
            <Link href="/signup" underline="hover" color="primary.main" sx={{ fontWeight: 500 }}>
              Create one here
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link href="/" underline="hover" color="text.secondary" sx={{ fontWeight: 500 }}>
              ← Back to Home
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 
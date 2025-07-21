import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, TextField, ToggleButton, ToggleButtonGroup, Paper, Alert, Link } from '@mui/material';

const roles = [
  { value: 'seeker', label: 'Seeker' },
  { value: 'builder', label: 'Builder/Realtor' },
  { value: 'admin', label: 'Admin' },
];

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState('seeker');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: role
          }
        }
      });
      
      if (authError) throw authError;
      
      // Create initial user record in both tables for consistency
      if (authData.user) {
        // Create basic user profile
        const { error: userProfileError } = await supabase
          .from('user_profiles')
          .insert([{ 
            id: authData.user.id,
            email: email,
            user_role: role
          }]);
        
        if (userProfileError) {
          console.error('Error creating user profile:', userProfileError);
        }
        
        // Create comprehensive profile entry
        const { error: profileError } = await supabase
          .from('Profile')
          .insert([{ 
            id: authData.user.id,
            email: email,
            user_role: role
          }]);
        
        if (profileError) {
          console.error('Error creating comprehensive profile:', profileError);
        }
      }
      
      setSuccess("Check your email for a confirmation link! Please verify your email before logging in.");
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
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join Homie AI and start your real estate journey
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSignup}>
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
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
              I am a:
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={role}
              exclusive
              onChange={(_, newRole) => newRole && setRole(newRole)}
              fullWidth
              sx={{ 
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  border: '1px solid #d1d5db',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  py: 1.5,
                  '&.Mui-selected': {
                    background: '#1f2937',
                    color: '#ffffff',
                    borderColor: '#1f2937',
                    '&:hover': {
                      background: '#111827',
                    }
                  },
                  '&:not(.Mui-selected)': {
                    background: '#ffffff',
                    color: '#6b7280',
                    '&:hover': {
                      background: '#f9fafb',
                      color: '#374151',
                    }
                  }
                }
              }}
            >
              {roles.map(r => (
                <ToggleButton key={r.value} value={r.value}>
                  {r.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Already have an account?{' '}
            <Link href="/login" underline="hover" color="primary.main" sx={{ fontWeight: 500 }}>
              Sign in here
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
};

export default Signup; 
import { Box, Typography, FormControlLabel, Switch, MenuItem, Select, Paper, Button } from '@mui/material';
import { useState } from 'react';

export default function Settings({ user }) {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [role, setRole] = useState(user.role);

  return (
    <Box maxWidth={500} mx="auto">
      <Typography variant="h4" mb={2}>Settings</Typography>
      <Paper sx={{ p: 3 }}>
        <FormControlLabel
          control={<Switch checked={notifications} onChange={e => setNotifications(e.target.checked)} />}
          label="Enable Notifications"
        />
        <Box mt={2}>
          <Typography variant="subtitle1">Language</Typography>
          <Select value={language} onChange={e => setLanguage(e.target.value)} fullWidth>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
          </Select>
        </Box>
        <Box mt={2}>
          <Typography variant="subtitle1">Account Role</Typography>
          <Select value={role} onChange={e => setRole(e.target.value)} fullWidth>
            <MenuItem value="seeker">Seeker</MenuItem>
            <MenuItem value="builder">Builder/Realtor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </Box>
        <Box mt={3}>
          <Button variant="contained" color="primary" fullWidth disabled>
            Save Settings (Mock)
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 
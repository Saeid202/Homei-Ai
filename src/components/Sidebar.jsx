import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider, Avatar, Typography, Button, Box, useMediaQuery, Badge } from '@mui/material';
import { Home, Person, House, Group, Chat, Settings, Workspaces } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 280;

export default function Sidebar({ user, onLogout, logoutLoading = false, messengerUnread = 0 }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userRole = user.user_metadata?.role || user.role;
  const isBuilder = userRole === 'builder';

  const getNavItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <Home />, path: '/dashboard' },
      { text: 'Properties', icon: <House />, path: '/properties' },
      { text: 'Opportunities', icon: <Workspaces />, path: '/opportunities' },
      { text: 'Groups', icon: <Group />, path: '/groups' },
      { text: 'Messenger', icon: <Chat />, path: '/messenger' },
      { text: 'Settings', icon: <Settings />, path: '/settings' },
    ];
    if (!isBuilder) {
      baseItems.splice(1, 0, { text: 'Profile', icon: <Person />, path: '/profile' });
    }
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <Toolbar sx={{ 
        minHeight: 80, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" letterSpacing={-0.5}>
          Homie AI
        </Typography>
      </Toolbar>
      
      <Box sx={{ p: 2 }}>
        <List sx={{ mt: 1 }}>
          {navItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                selected={selected}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  background: selected ? '#f3f4f6' : 'transparent',
                  color: selected ? '#1f2937' : '#6b7280',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: selected ? '#e5e7eb' : '#f9fafb',
                    color: '#1f2937',
                  },
                  px: 2,
                  py: 1.5,
                  minHeight: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  textDecoration: 'none',
                }}
              >
                <ListItemIcon sx={{ 
                  color: selected ? '#1f2937' : '#9ca3af', 
                  minWidth: 0, 
                  mr: isMobile ? 0 : 2,
                  transition: 'color 0.2s ease'
                }}>
                  {item.text === 'Messenger' && messengerUnread > 0 ? (
                    <Badge color="error" variant="dot" overlap="circular">
                      {item.icon}
                    </Badge>
                  ) : item.icon}
                </ListItemIcon>
                {!isMobile && (
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '.MuiTypography-root': { 
                        fontWeight: selected ? 600 : 500, 
                        fontSize: '0.875rem',
                        transition: 'font-weight 0.2s ease'
                      } 
                    }} 
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ borderColor: '#f3f4f6', mx: 2 }} />
      
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ 
          bgcolor: '#f3f4f6', 
          color: '#374151', 
          width: 48, 
          height: 48, 
          mb: 2,
          fontWeight: 600,
          fontSize: '1.125rem'
        }}>
          {user.email?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
          {user.email}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          {userRole === 'builder' ? 'Builder/Realtor' : userRole === 'seeker' ? 'Seeker' : 'Admin'}
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          onClick={onLogout}
          disabled={logoutLoading}
          sx={{ 
            color: '#6b7280', 
            borderColor: '#d1d5db', 
            '&:hover': { 
              borderColor: '#9ca3af', 
              background: '#f9fafb',
              color: '#374151'
            },
            '&:disabled': {
              color: '#9ca3af',
              borderColor: '#e5e7eb'
            }
          }}
        >
          {logoutLoading ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </Box>
    </Drawer>
  );
} 
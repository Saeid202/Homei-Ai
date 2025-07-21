import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Paper,
  Chip,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Home, 
  Search, 
  Handshake, 
  TrendingUp, 
  Security, 
  Speed,
  ArrowForward,
  Star,
  CheckCircle,
  People,
  Business,
  Analytics,
  Menu,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <Search sx={{ fontSize: 32 }} />,
    title: "AI-Powered Search",
    description: "Find your perfect property with intelligent recommendations based on your preferences."
  },
  {
    icon: <Handshake sx={{ fontSize: 32 }} />,
    title: "Direct Connections",
    description: "Connect directly with verified builders and realtors for better deals."
  },
  {
    icon: <TrendingUp sx={{ fontSize: 32 }} />,
    title: "Market Insights",
    description: "Get real-time market data and investment opportunities with predictive analytics."
  }
];

const stats = [
  { number: "10,000+", label: "Properties Listed" },
  { number: "5,000+", label: "Happy Users" },
  { number: "$2B+", label: "Properties Sold" }
];

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => navigate('/signup');
  const handleLearnMore = () => document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  const handleLogin = () => navigate('/login');

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #ede9fe 0%, #fdf2f8 100%)' }}>
      {/* Navigation Header */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#fff',
        borderBottom: '1px solid #ede9fe',
        boxShadow: '0 2px 8px 0 rgba(168,139,250,0.05)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Home sx={{ fontSize: 28, color: '#a78bfa', mr: 1 }} />
              <Typography variant="h6" fontWeight={700} sx={{ color: '#a78bfa', letterSpacing: 1, fontSize: '1.4rem' }}>
                Homie AI
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
              <Button variant="outlined" onClick={handleLogin} sx={{ color: '#a78bfa', borderColor: '#a78bfa', fontWeight: 700, borderRadius: 2, px: 3, py: 1, fontSize: '1rem', background: 'none', '&:hover': { borderColor: '#f472b6', color: '#f472b6', background: '#fdf2f8' } }}>Log in</Button>
              <Button variant="contained" onClick={handleGetStarted} sx={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6)', color: '#fff', fontWeight: 700, borderRadius: 2, px: 3, py: 1, fontSize: '1rem', boxShadow: 'none', '&:hover': { background: 'linear-gradient(90deg,#a78bfa,#f472b6)', opacity: 0.9 } }}>Sign up</Button>
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} sx={{ color: '#a78bfa' }}>
                <Menu />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ pt: 16, pb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            {/* Left Side: Headline, Subheadline, Buttons, Stats */}
            <Grid item xs={12} md={7}>
              <Box>
                <Typography sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.2rem', md: '3.2rem', lg: '3.5rem' },
                  lineHeight: 1.1,
                  mb: 2,
                  letterSpacing: -1,
                  color: '#312e81',
                  whiteSpace: 'pre-line'
                }}>
                  Find Your Perfect Property Match
                </Typography>
                <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 400, mb: 4, maxWidth: 540 }}>
                  Our AI-powered platform connects you with compatible properties, builders, or co-investors based on your lifestyle, budget, and location preferences.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" onClick={handleGetStarted} sx={{ background: '#a78bfa', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.5, fontSize: '1.1rem', boxShadow: 'none', '&:hover': { background: '#a78bfa', opacity: 0.9 } }}>
                    Get Started
                  </Button>
                  <Button variant="outlined" onClick={handleLearnMore} sx={{ borderColor: '#a78bfa', color: '#a78bfa', fontWeight: 700, borderRadius: 2, px: 4, py: 1.5, fontSize: '1.1rem', '&:hover': { borderColor: '#f472b6', color: '#f472b6', background: '#fdf2f8' } }}>
                    Learn More
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                  <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                    {[...Array(4)].map((_, i) => (
                      <Box key={i} sx={{ width: 18, height: 18, borderRadius: '50%', background: i === 0 ? '#a78bfa' : '#ede9fe', border: i === 0 ? '2px solid #fff' : 'none', boxShadow: i === 0 ? '0 2px 8px #a78bfa44' : 'none' }} />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#a78bfa', fontWeight: 600, fontSize: '1.1rem' }}>
                    5,000+ successful matches!
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {/* Right Side: Card Stack */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                <Card sx={{ width: '100%', maxWidth: 340, borderRadius: 4, boxShadow: '0 4px 32px #a78bfa22', p: 2, mb: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#ede9fe', color: '#a78bfa', mr: 2 }}>A</Avatar>
                      <Box>
                        <Typography fontWeight={700} color="#312e81">Alex, 28</Typography>
                        <Typography fontSize={14} color="#6b7280">Professional, Clean, Early bird</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontSize={13} color="#6b7280">Budget</Typography>
                    <Typography fontWeight={600} color="#312e81">$800-1200/month</Typography>
                    <Typography fontSize={13} color="#6b7280" mt={1}>Location</Typography>
                    <Typography fontWeight={600} color="#312e81">Downtown Seattle</Typography>
                    <Typography fontSize={13} color="#6b7280" mt={1}>Move-in</Typography>
                    <Typography fontWeight={600} color="#312e81">Aug 15 - Sep 1</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ width: '100%', maxWidth: 340, borderRadius: 4, boxShadow: '0 4px 32px #a78bfa22', p: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#ede9fe', color: '#a78bfa', mr: 2 }}>J</Avatar>
                      <Box>
                        <Typography fontWeight={700} color="#312e81">Jamie, 25</Typography>
                        <Typography fontSize={14} color="#6b7280">Student, Pet-friendly, Night owl</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontSize={13} color="#6b7280">Budget</Typography>
                    <Typography fontWeight={600} color="#312e81">$750-1100/month</Typography>
                    <Typography fontSize={13} color="#6b7280" mt={1}>Location</Typography>
                    <Typography fontWeight={600} color="#312e81">Capitol Hill</Typography>
                    <Typography fontSize={13} color="#6b7280" mt={1}>Move-in</Typography>
                    <Typography fontWeight={600} color="#312e81">Sep 1 - Sep 15</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 
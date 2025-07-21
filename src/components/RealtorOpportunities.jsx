import { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip, 
  Avatar, List, ListItem, ListItemText, ListItemAvatar, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { 
  TrendingUp, People, Business, LocationOn, AttachMoney,
  GroupAdd, Chat, Visibility
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

export default function RealtorOpportunities({ user }) {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch opportunities - this could be based on market data, group formations, etc.
    const fetchOpportunities = async () => {
      // For now, we'll create some mock opportunities based on property interests
      const { data: properties } = await supabase
        .from('properties')
        .select('*, property_interests(*)')
        .eq('builder_id', user.id);

      if (properties) {
        const opps = properties
          .filter(prop => prop.property_interests && prop.property_interests.length > 0)
          .map(prop => ({
            id: prop.id,
            propertyTitle: prop.title,
            propertyPrice: prop.price,
            interestedCount: prop.property_interests.length,
            seekers: prop.property_interests,
            type: 'Group Formation',
            description: `${prop.property_interests.length} seekers interested in ${prop.title}`,
            potentialValue: prop.price * 0.05, // 5% commission estimate
            location: prop.address_city || 'Toronto',
            status: 'Active'
          }));
        setOpportunities(opps);
      }
    };

    fetchOpportunities();
  }, [user]);

  const handleViewDetails = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setDialogOpen(true);
  };

  const getOpportunityIcon = (type) => {
    switch (type) {
      case 'Group Formation': return <GroupAdd />;
      case 'Market Trend': return <TrendingUp />;
      case 'Investment': return <AttachMoney />;
      default: return <Business />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Completed': return 'default';
      default: return 'info';
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Investment Opportunities</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{opportunities.length}</Typography>
                  <Typography color="text.secondary">Active Opportunities</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    ${opportunities.reduce((sum, opp) => sum + (opp.potentialValue || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">Potential Revenue</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {opportunities.reduce((sum, opp) => sum + opp.interestedCount, 0)}
                  </Typography>
                  <Typography color="text.secondary">Total Interested Seekers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Opportunities List */}
      <Grid container spacing={3}>
        {opportunities.map((opportunity) => (
          <Grid item xs={12} md={6} key={opportunity.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getOpportunityIcon(opportunity.type)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {opportunity.propertyTitle}
                  </Typography>
                </Box>
                
                <Typography color="text.secondary" mb={2}>
                  {opportunity.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={opportunity.type} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={opportunity.status} 
                    color={getStatusColor(opportunity.status)} 
                    size="small" 
                  />
                  <Chip 
                    icon={<LocationOn />}
                    label={opportunity.location} 
                    variant="outlined" 
                    size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    ${opportunity.propertyPrice?.toLocaleString()} • {opportunity.interestedCount} seekers
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${opportunity.potentialValue?.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => handleViewDetails(opportunity)}
                >
                  View Details
                </Button>
                <Button size="small" variant="outlined" startIcon={<Chat />}>
                  Contact Group
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Opportunity Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Opportunity Details: {selectedOpportunity?.propertyTitle}
        </DialogTitle>
        <DialogContent>
          {selectedOpportunity && (
            <Box>
              <Typography variant="h6" gutterBottom>Interested Seekers</Typography>
              <List>
                {selectedOpportunity.seekers.map((seeker, index) => (
                  <Box key={seeker.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>{seeker.user_email[0].toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={seeker.user_email}
                        secondary={seeker.description}
                      />
                      <Button size="small" variant="outlined">
                        View Profile
                      </Button>
                    </ListItem>
                    {index < selectedOpportunity.seekers.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Opportunity Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Property Value</Typography>
                  <Typography variant="h6">${selectedOpportunity.propertyPrice?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Potential Commission</Typography>
                  <Typography variant="h6" color="success.main">${selectedOpportunity.potentialValue?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Interested Seekers</Typography>
                  <Typography variant="h6">{selectedOpportunity.interestedCount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="h6">{selectedOpportunity.location}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained">Start Group Chat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
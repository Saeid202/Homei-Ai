import { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import PropertyListingForm from '../components/PropertyListingForm';
import RealtorListings from '../components/RealtorListings';
import RealtorMessages from '../components/RealtorMessages';
import RealtorOpportunities from '../components/RealtorOpportunities';

export default function RealtorDashboard({ user }) {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Typography variant="h4" mb={2}>Realtor/Builder Dashboard</Typography>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="My Listings" />
          <Tab label="Add New Listing" />
          <Tab label="Opportunities" />
          <Tab label="Messages" />
        </Tabs>
      </Paper>
      {tab === 0 && <RealtorListings user={user} />}
      {tab === 1 && <PropertyListingForm user={user} />}
      {tab === 2 && <RealtorOpportunities user={user} />}
      {tab === 3 && <RealtorMessages user={user} />}
    </Box>
  );
} 
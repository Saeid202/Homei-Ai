import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const seekerContent = (
  <>
    <Typography variant="h5" mb={2}>Welcome, Seeker!</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Property Recommendations</Typography>
            <Typography>🏠 123 Maple St, Toronto<br/>🏢 456 Oak Ave, Toronto</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Investor Matches</Typography>
            <Typography>Jane D. (Toronto)<br/>Alex P. (Toronto)</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </>
);

const adminContent = (
  <>
    <Typography variant="h5" mb={2}>Welcome, Admin!</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Platform Health</Typography>
            <Typography>Active Users: 320<br/>Flagged Content: 2</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">User Activity</Typography>
            <Typography>New Signups: 8<br/>Disputes: 1</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </>
);

export default function Dashboard({ user }) {
  let content;
  if (user.role === 'seeker') content = seekerContent;
  else content = adminContent;

  return (
    <Box>
      {content}
    </Box>
  );
} 
import { Box, Typography, Avatar, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function PropertyContextPanel({ property, participants, users }) {
  const navigate = useNavigate();
  if (!property) return null;
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1">Listing Info</Typography>
      <Avatar src={property.photo_url} sx={{ width: 56, height: 56, mb: 1 }}>
        {property.title?.[0]}
      </Avatar>
      <Typography variant="body2" color="text.secondary">{property.title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {property.address_street_num || ''} {property.address_street || ''} {property.address_city || ''}
      </Typography>
      <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/properties/${property.id}`)}>
        View Listing
      </Button>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Participants</Typography>
      <Stack direction="column" spacing={1} mt={1}>
        {participants && participants.map(uid => {
          const user = users?.find(u => u.id === uid);
          return (
            <Box key={uid} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24 }}>{user?.email?.[0] || '?'}</Avatar>
              <Typography variant="body2">{user?.email || uid}</Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
} 
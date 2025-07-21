import { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip, 
  IconButton, Dialog, DialogTitle, DialogContent, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, Badge, Divider, TextField, Stack, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import { supabase } from '../supabaseClient';

function InterestedSeekers({ propertyId, propertyTitle }) {
  const [interests, setInterests] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profiles, setProfiles] = useState({});

  // Group chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Reply state
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyToUser, setReplyToUser] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const fetchInterests = async () => {
      const { data } = await supabase
        .from('property_interests')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      setInterests(data || []);
      
      // Fetch profiles for users who opted to show them
      const userIds = data
        ?.filter(interest => interest.show_profile_to_others)
        .map(interest => interest.user_id) || [];
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('Profile')
          .select('*')
          .in('id', userIds);
        
        const profileMap = {};
        profileData?.forEach(profile => {
          profileMap[profile.id] = profile;
        });
        setProfiles(profileMap);
      }
    };
    fetchInterests();
  }, [propertyId]);

  // Fetch messages for group chat
  useEffect(() => {
    if (!chatOpen) return;
    let isMounted = true;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('property_group_messages')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: true });
      if (!error && isMounted) setMessages(data || []);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [chatOpen, propertyId]);

  const handleViewCandidate = async (userId) => {
    setLoadingProfile(true);
    const { data } = await supabase
      .from('Profile')
      .select('*')
      .eq('id', userId)
      .single();
    setSelectedProfile(data);
    setProfileDialogOpen(true);
    setLoadingProfile(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from('property_group_messages').insert([{
      property_id: propertyId,
      user_id: 'builder', // This will be the builder's ID
      user_email: 'Builder',
      message: newMessage,
    }]);
    setSending(false);
    setNewMessage('');
    // Refetch messages
    const { data } = await supabase
      .from('property_group_messages')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const handleReply = (user) => {
    setReplyToUser(user);
    setReplyDialogOpen(true);
  };
  const sendReply = async () => {
    if (!replyToUser || !replyMessage.trim()) return;
    // Implement sending reply to candidate (e.g., via supabase)
    await supabase.from('property_candidate_messages').insert([
      {
        property_id: propertyId,
        candidate_id: replyToUser.user_id,
        message: replyMessage,
        sender: 'builder',
      },
    ]);
    setReplyDialogOpen(false);
    setReplyMessage('');
    setReplyToUser(null);
  };

  return (
    <Box mt={2} mb={2}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Interested Candidates
      </Typography>
      
      {/* Show interest labels */}
      <Stack direction="column" spacing={1} mb={2}>
        {interests.map((interest) => (
          <Chip
            key={interest.id}
            label={interest.description}
            color="info"
            variant="outlined"
            sx={{ mb: 0.5 }}
          />
        ))}
      </Stack>

      {interests.length === 0 ? (
        <Typography color="text.secondary">No candidates have expressed interest yet.</Typography>
      ) : (
        <List>
          {interests.map(interest => {
            const profile = profiles[interest.user_id];
            const displayName = interest.display_real_name && interest.user_name 
              ? interest.user_name 
              : interest.user_email;
            return (
              <ListItem key={interest.id} alignItems="flex-start" divider>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: interest.display_real_name ? 'success.main' : 'grey.500',
                    fontSize: '0.875rem'
                  }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {displayName}
                      </Typography>
                      {interest.display_real_name && (
                        <Chip 
                          label="Real Name" 
                          size="small" 
                          color="success" 
                          sx={{ height: '20px', fontSize: '0.6rem' }}
                        />
                      )}
                      <Chip 
                        label={interest.interest_level ? interest.interest_level.replace('_', ' ') : ''} 
                        size="small" 
                        color="primary"
                        sx={{ height: '20px', fontSize: '0.6rem' }}
                      />
                      {interest.investment_amount && (
                        <Chip 
                          label={`$${interest.investment_amount.toLocaleString()}`} 
                          size="small" 
                          color="success"
                          sx={{ height: '20px', fontSize: '0.6rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {interest.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Preferred role: {interest.preferred_role ? interest.preferred_role.replace('_', ' ') : ''} • 
                        Interest level: {interest.interest_level ? interest.interest_level.replace('_', ' ') : ''}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    onClick={() => handleViewCandidate(interest.user_id)} 
                    variant="outlined" 
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    View Profile
                  </Button>
                  <Button 
                    onClick={() => handleReply(interest)} 
                    variant="contained" 
                    size="small" 
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Contact
                  </Button>
                  <Button
                    onClick={() => {/* logic to invite to group chat */}}
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Invite to Group Chat
                  </Button>
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}

      {/* Action buttons */}
      {/* Removed Group Match button */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button size="small" variant="outlined">
          Invite
        </Button>
      </Box>

      {/* Candidate Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Candidate Profile</DialogTitle>
        <DialogContent>
          {loadingProfile ? (
            <Typography>Loading...</Typography>
          ) : selectedProfile ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProfile.first_name} {selectedProfile.last_name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography>Email: {selectedProfile.email}</Typography>
              <Typography>Phone: {selectedProfile.phone}</Typography>
              <Typography>Location: {selectedProfile.city}, {selectedProfile.province}</Typography>
              <Typography>Bio: {selectedProfile.bio}</Typography>
              {/* Add more fields as needed */}
            </Box>
          ) : (
            <Typography>No profile found.</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Group Match Chat Dialog */}
      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Group Match Chat for: {propertyTitle}</DialogTitle>
        <DialogContent dividers sx={{ minHeight: 300, maxHeight: 400, overflowY: 'auto' }}>
          {messages.length === 0 && <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>}
          {messages.map((msg) => (
            <Box key={msg.id} sx={{ mb: 2, textAlign: msg.user_email === 'Builder' ? 'right' : 'left' }}>
              <Typography variant="body2" color={msg.user_email === 'Builder' ? 'primary' : 'text.secondary'}>
                <b>{msg.user_email}:</b> {msg.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(msg.created_at).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSendMessage(); }}
            disabled={sending}
          />
          <Button variant="contained" onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)}>
        <DialogTitle>Reply to Candidate</DialogTitle>
        <DialogContent>
          <TextField
            label="Message"
            multiline
            rows={4}
            value={replyMessage}
            onChange={e => setReplyMessage(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={sendReply} disabled={!replyMessage.trim()} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function RealtorListings({ user }) {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [lockingBuyers, setLockingBuyers] = useState({}); // { propertyId: { email, locked_at } }
  const [buyerProfiles, setBuyerProfiles] = useState({}); // { propertyId: profileObj }
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('builder_id', user.id)
        .order('created_at', { ascending: false });
      if (isMounted) setListings(data || []);
      // Fetch locking buyer emails for locked properties
      const locked = (data || []).filter(l => l.locked_by);
      if (locked.length > 0) {
        const ids = locked.map(l => l.locked_by);
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id, email')
          .in('id', ids);
        const map = {};
        locked.forEach(l => {
          const buyer = users?.find(u => u.id === l.locked_by);
          map[l.id] = { email: buyer?.email, locked_at: l.locked_at };
        });
        if (isMounted) setLockingBuyers(map);
      } else {
        if (isMounted) setLockingBuyers({});
      }
    };
    fetchListings();
    const interval = setInterval(fetchListings, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [user]);

  // Fetch buyer profiles for locked properties
  useEffect(() => {
    const fetchBuyerProfiles = async () => {
      const lockedListings = listings.filter(l => l.locked_by);
      if (lockedListings.length === 0) {
        setBuyerProfiles({});
        return;
      }
      const ids = lockedListings.map(l => l.locked_by);
      const { data: profiles } = await supabase
        .from('Profile')
        .select('*')
        .in('id', ids);
      const map = {};
      lockedListings.forEach(l => {
        map[l.id] = profiles?.find(p => p.id === l.locked_by);
      });
      setBuyerProfiles(map);
    };
    if (listings.length > 0) fetchBuyerProfiles();
  }, [listings]);

  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setViewDialogOpen(true);
  };

  const handleDeleteListing = (listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteListing = async () => {
    if (!listingToDelete) return;
    await supabase.from('properties').delete().eq('id', listingToDelete.id);
    setListings(listings.filter(l => l.id !== listingToDelete.id));
    setDeleteDialogOpen(false);
    setListingToDelete(null);
  };

  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setEditDialogOpen(true);
  };

  const handleApprove = (userId) => {
    // Mock approval logic
    console.log('Approved user:', userId);
  };

  const handleReject = (userId) => {
    // Mock rejection logic
    console.log('Rejected user:', userId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Sold': return 'default';
      default: return 'info';
    }
  };

  return (
    <Box>
      <Typography 
        variant="h3" 
        mb={4} 
        sx={{ 
          fontWeight: 800,
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center'
        }}
      >
        My Property Listings
      </Typography>

      {/* Properties Grid - 2 per row */}
      <Grid container spacing={3}>
        {listings.map((listing) => {
          const isLocked = !!listing.locked_by;
          const lockInfo = lockingBuyers[listing.id];
          const buyerProfile = buyerProfiles[listing.id];
          return (
            <Grid item xs={12} md={6} key={listing.id}>
              <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                overflow: 'visible', // allow content to overflow if needed
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(37,99,235,0.10)',
                  borderColor: '#2563EB'
                }
              }}>
                {/* Property Image Section */}
                <Box sx={{ position: 'relative', height: 140 }}>
                  <Box sx={{ width: '100%', height: '100%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {listing.photo_url ? (
                      <img
                        src={listing.photo_url}
                        alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '2rem', fontWeight: 700 }}>
                        {listing.title ? listing.title[0].toUpperCase() : '🏠'}
                      </Box>
                    )}
                  </Box>
                  {/* Price Badge */}
                  <Box sx={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', px: 2, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 8px rgba(16,185,129,0.15)' }}>
                    ${listing.price?.toLocaleString()}
                  </Box>
                  {/* Lock Badge */}
                  {isLocked && (
                    <Box sx={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: 'white', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LockIcon sx={{ fontSize: '1rem' }} /> Locked
                    </Box>
                  )}
                </Box>
                {/* Property Details Section */}
                <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, lineHeight: 1.2, fontSize: '1.1rem' }}>
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.5, mb: 1, fontSize: '0.95rem', minHeight: 36, maxHeight: 36, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {listing.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Chip label={listing.status} size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                    <Chip label={listing.type} size="small" color="secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Bedrooms: <b>{listing.bedrooms}</b></Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Baths: <b>{listing.bathrooms}</b></Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>Size: <b>{listing.size} sqft</b></Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                    Available: {listing.available_date ? new Date(listing.available_date).toLocaleDateString() : 'TBD'}
                  </Typography>
                  {isLocked && buyerProfile && (
                    <Box sx={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', borderRadius: 2, border: '1px solid #F59E0B', p: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 600, display: 'block' }}>🔒 Locked by Buyer</Typography>
                      <Typography variant="body2" sx={{ color: '#92400E', fontWeight: 600 }}>{buyerProfile.first_name} {buyerProfile.last_name}</Typography>
                      <Typography variant="caption" sx={{ color: '#92400E', fontSize: '0.7rem' }}>Locked at: {listing.locked_at ? new Date(listing.locked_at).toLocaleString() : ''}</Typography>
                    </Box>
                  )}
                  {/* Interested Seekers Section (fully visible, no scroll) */}
                  <Box sx={{ mt: 1, borderTop: '1px solid #F1F5F9', pt: 1 }}>
                    <InterestedSeekers propertyId={listing.id} propertyTitle={listing.title} />
                  </Box>
                </CardContent>
                {/* Actions Section */}
                <CardActions sx={{
                  p: 1.5, pt: 0, pb: 2, // add extra bottom padding
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 1,
                  overflow: 'visible' // ensure buttons are not clipped
                }}>
                  <Button size="small" startIcon={<EditIcon />} variant="contained" onClick={() => handleEditListing(listing)} sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5, minWidth: 0 }}>Edit</Button>
                  <Button size="small" startIcon={<VisibilityIcon />} variant="contained" onClick={() => handleViewListing(listing)} sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5, minWidth: 0, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>View</Button>
                  <Button size="small" startIcon={<DeleteIcon />} variant="outlined" color="error" onClick={() => handleDeleteListing(listing)} sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5, minWidth: 0 }}>Delete</Button>
                  <Button size="small" startIcon={<ChatIcon />} variant="outlined" onClick={() => console.log('Chat with buyers for:', listing.id)} sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5, minWidth: 0 }}>Chat</Button>
                  <Button size="small" startIcon={<PeopleIcon />} variant="outlined" onClick={() => console.log('View interested buyers for:', listing.id)} sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5, minWidth: 0 }}>Buyers</Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {listings.length === 0 && (
        <Box sx={{ 
          p: 8, 
          textAlign: 'center',
          color: '#64748B',
          background: 'white',
          borderRadius: 3,
          border: '1px solid #E2E8F0'
        }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            No Properties Listed
          </Typography>
          <Typography variant="body1">
            Start by adding your first property listing.
          </Typography>
        </Box>
      )}
      {/* View Listing Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Property Details</DialogTitle>
        <DialogContent>
          {selectedListing && (
            <Box>
              <Typography variant="h6">{selectedListing.title}</Typography>
              <Typography color="text.secondary">{selectedListing.description}</Typography>
              <Typography>Price: ${selectedListing.price}</Typography>
              <Typography>Type: {selectedListing.type}</Typography>
              <Typography>Status: {selectedListing.status}</Typography>
              <Typography>Address: {selectedListing.address_street_num} {selectedListing.address_street}, {selectedListing.address_city}, {selectedListing.address_province}, {selectedListing.address_postal_code}</Typography>
              <Typography>Bedrooms: {selectedListing.bedrooms}</Typography>
              <Typography>Bathrooms: {selectedListing.bathrooms}</Typography>
              <Typography>Size: {selectedListing.size} sqft</Typography>
              <Typography>Amenities: {selectedListing.amenities?.join(', ')}</Typography>
              <Typography>Available Date: {selectedListing.available_date}</Typography>
              <img src={selectedListing.photo_url || 'https://via.placeholder.com/400x180?text=No+Image'} alt="property" style={{ width: 300, marginTop: 16, borderRadius: 8 }} onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this property listing?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDeleteListing}>Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Listing Dialog (optional, can be implemented as a form) */}
      {/* ... */}
      {/* Buyer Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Buyer Profile</DialogTitle>
        <DialogContent>
          {selectedProfile ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProfile.first_name} {selectedProfile.last_name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography>Email: {selectedProfile.email}</Typography>
              <Typography>Phone: {selectedProfile.phone}</Typography>
              <Typography>Location: {selectedProfile.city}, {selectedProfile.province}</Typography>
              <Typography>Bio: {selectedProfile.bio}</Typography>
              {/* Add more fields as needed */}
            </Box>
          ) : (
            <Typography>No profile found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
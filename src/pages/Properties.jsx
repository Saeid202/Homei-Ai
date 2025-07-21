import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Stack, IconButton, Divider } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { supabase } from '../supabaseClient';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import GroupIcon from '@mui/icons-material/Group';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockIcon from '@mui/icons-material/Lock';
import { Checkbox, FormControlLabel } from '@mui/material';
import EnhancedInterestForm from '../components/EnhancedInterestForm';

export default function Properties({ user }) {
  const [properties, setProperties] = useState([]);
  const [interests, setInterests] = useState({}); // { propertyId: [interest, ...] }
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interestDescription, setInterestDescription] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);

  // Group chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProperty, setChatProperty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareProperty, setShareProperty] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [groupSuccess, setGroupSuccess] = useState('');

  // Add state for messaging
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageProperty, setMessageProperty] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [messageError, setMessageError] = useState('');

  // Lock property state
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockProperty, setLockProperty] = useState(null);
  const [lockAgreementChecked, setLockAgreementChecked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  // Enhanced interest form state
  const [enhancedInterestOpen, setEnhancedInterestOpen] = useState(false);
  const [enhancedInterestProperty, setEnhancedInterestProperty] = useState(null);

  // New state for profile dialogs
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [groupChatDialogOpen, setGroupChatDialogOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch properties (with polling)
  useEffect(() => {
    let isMounted = true;
    const fetchProperties = async () => {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (!error && isMounted) {
        console.log('Fetched properties:', data); // Debug: Check property data
        setProperties(data || []);
      }
    };
    fetchProperties();
    const interval = setInterval(fetchProperties, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // Fetch interests for all properties
  useEffect(() => {
    const fetchInterests = async () => {
      const { data, error } = await supabase.from('property_interests').select('*');
      if (!error && data) {
        // Group by property_id
        const grouped = {};
        data.forEach((interest) => {
          if (!grouped[interest.property_id]) grouped[interest.property_id] = [];
          grouped[interest.property_id].push(interest);
        });
        setInterests(grouped);
      }
    };
    fetchInterests();
  }, [properties, dialogOpen]); // refetch when dialog closes (new interest added)

  // Add a helper to fetch user profile if needed
  async function fetchUserProfile(userId) {
    const { data, error } = await supabase
      .from('Profile')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();
    return data || {};
  }

  useEffect(() => {
    async function ensureUserProfile() {
      if (user && (!user.first_name || !user.last_name)) {
        const profile = await fetchUserProfile(user.id);
        if (profile.first_name && profile.last_name) {
          user.first_name = profile.first_name;
          user.last_name = profile.last_name;
        }
      }
    }
    ensureUserProfile();
  }, [user]);

  // Handle "I'm Interested" click
  const handleInterestedClick = (property) => {
    setEnhancedInterestProperty(property);
    setEnhancedInterestOpen(true);
  };

  // Handle dialog submit
  const handleDialogSubmit = async () => {
    if (!user || !selectedProperty) return;
    setLoading(true);
    const { error } = await supabase.from('property_interests').insert([{
      property_id: selectedProperty.id,
      user_id: user.id,
      user_email: user.email,
      description: interestDescription,
    }]);
    setLoading(false);
    setDialogOpen(false);
    if (error) alert('Error expressing interest: ' + error.message);
  };

  // Group Match: open chat dialog
  const handleGroupMatchClick = (property) => {
    setChatProperty(property);
    setChatOpen(true);
    setMessages([]);
  };

  // Fetch messages for the selected property
  useEffect(() => {
    if (!chatOpen || !chatProperty) return;
    let isMounted = true;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('property_group_messages')
        .select('*')
        .eq('property_id', chatProperty.id)
        .order('created_at', { ascending: true });
      if (!error && isMounted) setMessages(data || []);
    };
    fetchMessages();
    // Optionally, poll for new messages every 3s
    const interval = setInterval(fetchMessages, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [chatOpen, chatProperty]);

  // Send a new group message
  const handleSendMessage = async () => {
    if (!user || !chatProperty || !newMessage.trim()) return;
    setSending(true);
    const userName = (user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : user.email;
    const { error } = await supabase.from('property_group_messages').insert([{
      property_id: chatProperty.id,
      user_id: user.id,
      user_email: user.email,
      user_name: userName, // <-- store real name if available
      message: newMessage,
    }]);
    setSending(false);
    setNewMessage('');
    // Refetch messages
    const { data } = await supabase
      .from('property_group_messages')
      .select('*')
      .eq('property_id', chatProperty.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  // Share handlers
  const handleShareClick = (property) => {
    setShareProperty(property);
    setShareDialogOpen(true);
    setCopySuccess('');
  };
  const handleCopyLink = () => {
    if (!shareProperty) return;
    const link = `${window.location.origin}/property/${shareProperty.id}`;
    navigator.clipboard.writeText(link);
    setCopySuccess('Link copied!');
  };
  const handleWhatsAppShare = () => {
    if (!shareProperty) return;
    const link = `${window.location.origin}/property/${shareProperty.id}`;
    const text = encodeURIComponent(
      `Check out this property: ${shareProperty.title}\n${shareProperty.description}\n${link}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  const handleTelegramShare = () => {
    if (!shareProperty) return;
    const link = `${window.location.origin}/property/${shareProperty.id}`;
    const text = encodeURIComponent(
      `Check out this property: ${shareProperty.title}\n${shareProperty.description}\n${link}`
    );
    window.open(`https://t.me/share/url?url=${link}&text=${text}`, '_blank');
  };

  // Group Match handler (create/join group, then show link to Groups)
  const handleGroupMatch = async (property) => {
    setGroupLoading(true);
    setGroupError('');
    setGroupSuccess('');
    try {
      // 1. Check if a group conversation exists for this property
      let { data: conv, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_id', property.id)
        .eq('is_group', true)
        .single();
      if (!conv) {
        // Create group conversation
        const { data: newConv, error: createErr } = await supabase
          .from('conversations')
          .insert([{ property_id: property.id, is_group: true }])
          .select()
          .single();
        conv = newConv;
      }
      // Add user as a participant if not already
      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.id);
      const participantIds = parts ? parts.map(p => p.user_id) : [];
      if (!participantIds.includes(user.id)) {
        await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: user.id });
      }
      setGroupSuccess('Group created! Go to Messenger to chat.');
      navigate('/messenger');
    } catch (err) {
      setGroupError('Could not join or create group: ' + (err.message || err));
    } finally {
      setGroupLoading(false);
    }
  };

  // Open message dialog and fetch conversation
  const handleMessageSeller = async (property) => {
    if (!user || !property.builder_id) return;
    // 1. Check if a direct conversation exists for this property and these two users
    let { data: conv, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', property.id)
      .eq('is_group', false)
      .single();
    if (!conv) {
      // Create conversation
      const { data: newConv, error: createErr } = await supabase
        .from('conversations')
        .insert([{ property_id: property.id, is_group: false }])
        .select()
        .single();
      conv = newConv;
    }
    // Add participants if not already
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conv.id);
    const participantIds = parts ? parts.map(p => p.user_id) : [];
    if (!participantIds.includes(user.id)) {
      await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: user.id });
    }
    if (!participantIds.includes(property.builder_id)) {
      await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: property.builder_id });
    }
    // Redirect to Messenger and select this conversation
    navigate('/messenger');
  };

  // Send message to seller
  const handleSendMessageToSeller = async () => {
    if (!messageText.trim() || !messageProperty) return;
    setMessageLoading(true);
    setMessageError('');
    const builderId = messageProperty.builder_id;
    if (!builderId) {
      setMessageError('This property does not have a seller/builder assigned.');
      setMessageLoading(false);
      return;
    }
    const { error: insertError } = await supabase.from('property_direct_messages').insert([{
      property_id: messageProperty.id,
      sender_id: user.id,
      receiver_id: builderId,
      message: messageText,
    }]);
    if (insertError) setMessageError(insertError.message);
    setMessageText('');
    // Refetch conversation
    const { data, error } = await supabase
      .from('property_direct_messages')
      .select('*')
      .eq('property_id', messageProperty.id)
      .in('sender_id', [user.id, builderId])
      .in('receiver_id', [user.id, builderId])
      .order('created_at', { ascending: true });
    if (error) setMessageError(error.message);
    setConversation(data || []);
    setMessageLoading(false);
  };

  // Lock property logic
  const handleLockProperty = (property) => {
    setLockProperty(property);
    setLockAgreementChecked(false);
    setLockDialogOpen(true);
  };
  const handleLockAgreement = async () => {
    if (!user || !lockProperty) return;
    setLockLoading(true);
    await supabase.from('properties').update({
      locked_by: user.id,
      locked_by_email: user.email, // <-- add this line
      locked_at: new Date().toISOString(),
      lock_agreement_accepted: true,
    }).eq('id', lockProperty.id);
    setLockDialogOpen(false);
    setLockLoading(false);
    setLockProperty(null);
    // Refetch properties
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    setProperties(data || []);
  };

  async function handleViewProfile(userId) {
    setLoadingProfile(true);
    const { data } = await supabase
      .from('Profile')
      .select('*')
      .eq('id', userId)
      .single();
    setSelectedProfile(data);
    setProfileDialogOpen(true);
    setLoadingProfile(false);
  }

  async function handleContact(userId, property) {
    if (!user || !userId || !property) return;
    // 1. Check if a direct conversation exists for this property and these two users
    let { data: conv, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', property.id)
      .eq('is_group', false)
      .single();
    if (!conv) {
      // Create conversation
      const { data: newConv, error: createErr } = await supabase
        .from('conversations')
        .insert([{ property_id: property.id, is_group: false }])
        .select()
        .single();
      conv = newConv;
    }
    // Add participants if not already
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conv.id);
    const participantIds = parts ? parts.map(p => p.user_id) : [];
    if (!participantIds.includes(user.id)) {
      await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: user.id });
    }
    if (!participantIds.includes(userId)) {
      await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: userId });
    }
    // Redirect to Messenger and select this conversation
    navigate(`/messenger?conversationId=${conv.id}`);
  }

  // Invite to Group Chat handler
  async function handleInviteToGroupChat(userId, property) {
    if (!user || !userId || !property) return;
    setGroupChatDialogOpen(true);
    setGroupError('');
    setGroupSuccess('');
    try {
      // 1. Check if a group conversation exists for this property
      let { data: conv, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_id', property.id)
        .eq('is_group', true)
        .single();
      console.log('Fetched/created group conversation:', conv, error);
      if (!conv) {
        // Create group conversation
        const { data: newConv, error: createErr } = await supabase
          .from('conversations')
          .insert([{ property_id: property.id, is_group: true }])
          .select()
          .single();
        conv = newConv;
        console.log('Created new group conversation:', conv, createErr);
      }
      // Add inviter as a participant if not already
      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.id);
      const participantIds = Array.isArray(parts) ? parts.map(p => p.user_id) : [];
      console.log('Current participants:', participantIds);
      if (!participantIds.includes(user.id)) {
        const addRes = await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: user.id });
        console.log('Added inviter as participant:', addRes);
      }
      // Create a group invitation for the invitee (do not add as participant yet)
      const { error: inviteError, data: inviteData } = await supabase.from('group_invitations').insert({
        group_conversation_id: conv.id,
        property_id: property.id,
        inviter_id: user.id,
        invitee_id: userId,
        status: 'pending'
      });
      console.log('Group invitation insert result:', inviteData, inviteError);
      if (inviteError && !inviteError.message.includes('duplicate key')) {
        throw inviteError;
      }
      setGroupSuccess('Invitation sent! The user will see it in Messenger and can accept to join the group chat.');
    } catch (err) {
      setGroupError('Could not send group invitation: ' + (err.message || err));
      console.error('Group invitation error:', err);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
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
        Property Listings
      </Typography>

      {/* Properties Grid - 2 per row */}
      <Grid container spacing={3}>
        {properties.map((property) => {
          const isLocked = !!property.locked_by;
          const isLockedByMe = property.locked_by === user?.id;
          const isBuilder = property.builder_id === user?.id;
          return (
            <Grid xs={12} lg={6} key={property.id}>
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                    borderColor: '#2563EB'
                  }
                }}
              >
                {/* Property Image Section */}
                <Box sx={{ position: 'relative', height: 200 }}>
                  {/* Main Image */}
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%',
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {property.photo_url ? (
                      <img
                        src={property.photo_url}
                        alt={property.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', property.photo_url);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', property.photo_url);
                        }}
                      />
                    ) : null}
                    {/* Fallback placeholder */}
                    <Box
                      sx={{
                        display: property.photo_url ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
                        color: '#64748B',
                        fontSize: '2rem',
                        fontWeight: 700
                      }}
                    >
                      {property.title ? property.title[0].toUpperCase() : '🏠'}
                    </Box>
                  </Box>

                  {/* Status Badges */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 12, 
                    left: 12, 
                    right: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    {/* Price Badge */}
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      ${property.price?.toLocaleString()}
                    </Box>

                    {/* Lock Status Badge */}
                    {isLocked && (
                      <Box
                        sx={{
                          background: isLockedByMe 
                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <LockIcon sx={{ fontSize: '0.875rem' }} />
                        {isLockedByMe ? 'Locked' : 'Negotiating'}
                      </Box>
                    )}
                  </Box>

                  {/* Status Indicator */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 12, 
                    left: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: isLocked 
                          ? (isLockedByMe ? '#10B981' : '#F97316')
                          : '#10B981',
                        boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.8)'
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                        fontSize: '0.75rem'
                      }}
                    >
                      {isLocked 
                        ? (isLockedByMe ? 'Locked by You' : 'Under Negotiation')
                        : 'Available'
                      }
                    </Typography>
                  </Box>
                </Box>

                {/* Property Details Section */}
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Title and Description */}
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#0F172A',
                        mb: 1,
                        lineHeight: 1.3,
                        fontSize: '1.25rem'
                      }}
                    >
                      {property.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748B',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2
                      }}
                    >
                      {property.description}
                    </Typography>
                  </Box>

                  {/* Property Info Grid */}
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    mb: 3
                  }}>
                    {/* Builder Info */}
                    <Box sx={{ 
                      p: 2,
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                      borderRadius: 2,
                      border: '1px solid #E2E8F0'
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#64748B',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontSize: '0.7rem'
                        }}
                      >
                        Builder
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#0F172A',
                          fontWeight: 600,
                          mt: 0.5
                        }}
                      >
                        {property.builder_name}
                      </Typography>
                    </Box>

                    {/* Interest Count */}
                    <Box sx={{ 
                      p: 2,
                      background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                      borderRadius: 2,
                      border: '1px solid #3B82F6'
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#1E40AF',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontSize: '0.7rem'
                        }}
                      >
                        Interest
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1E40AF',
                          fontWeight: 700,
                          mt: 0.5
                        }}
                      >
                        {(interests[property.id] || []).length} buyer{(interests[property.id] || []).length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>

                                      {/* Interest Chips */}
                    {(interests[property.id] || []).length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#64748B',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: '0.7rem',
                            mb: 1,
                            display: 'block'
                          }}
                        >
                          Recent Interests
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {(interests[property.id] || []).slice(0, 2).map((interest) => {
                            const displayName = interest.display_real_name && interest.user_name 
                              ? interest.user_name 
                              : 'Anonymous';
                            const chipLabel = interest.display_real_name 
                              ? `${displayName} - ${interest.interest_level ? interest.interest_level.replace('_', ' ') : ''}`
                              : `${interest.interest_level ? interest.interest_level.replace('_', ' ') : ''}`;
                            
                            return (
                              <Chip
                                key={interest.id}
                                label={chipLabel}
                                sx={{
                                  background: interest.display_real_name 
                                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                                  color: interest.display_real_name ? 'white' : '#92400E',
                                  border: `1px solid ${interest.display_real_name ? '#10B981' : '#F59E0B'}`,
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  height: '24px'
                                }}
                              />
                            );
                          })}
                          {(interests[property.id] || []).length > 2 && (
                            <Chip
                              label={`+${(interests[property.id] || []).length - 2} more`}
                              sx={{
                                background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
                                color: '#475569',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: '24px'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                </Box>

                {/* Interested Candidates Section */}
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Interested Candidates
                  </Typography>
                  <Box>
                    {(interests[property.id] || []).map((interest) => {
                      const displayName = interest.display_real_name && interest.user_name 
                        ? interest.user_name 
                        : interest.user_email;
                      return (
                        <Box key={interest.id} sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          background: '#f8fafb',
                          border: '1px solid #E2E8F0',
                        }}>
                          <Box sx={{ minWidth: 48 }}>
                            <Chip
                              label={displayName}
                              sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 1 }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <Chip 
                                label={interest.interest_level ? interest.interest_level.replace('_', ' ') : ''} 
                                size="small" 
                                color="primary"
                                sx={{ height: '20px', fontSize: '0.7rem' }}
                              />
                              {interest.investment_amount && (
                                <Chip 
                                  label={`$${interest.investment_amount.toLocaleString()}`} 
                                  size="small" 
                                  color="success"
                                  sx={{ height: '20px', fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {interest.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Preferred role: {interest.preferred_role ? interest.preferred_role.replace('_', ' ') : ''} • 
                              Interest level: {interest.interest_level ? interest.interest_level.replace('_', ' ') : ''}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                              onClick={() => handleViewProfile(interest.user_id)}
                            >
                              View Profile
                            </Button>
                            <Button 
                              variant="contained" 
                              size="small" 
                              sx={{ fontSize: '0.7rem' }}
                              onClick={() => handleContact(interest.user_id, property)}
                            >
                              Contact
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                              onClick={() => handleInviteToGroupChat(interest.user_id, property)}
                            >
                              Invite to Group Chat
                            </Button>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Actions Section */}
                <Box sx={{ 
                  p: 3, 
                  borderTop: '1px solid #F1F5F9',
                  background: '#FAFAFA'
                }}>
                  {/* Primary Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {/* Lock Property Button */}
                    {!isLocked && !isBuilder && (
                      <Button
                        size="small"
                        startIcon={<LockIcon />}
                        variant="contained"
                        color="warning"
                        onClick={() => handleLockProperty(property)}
                        className="btn-animate"
                        sx={{
                          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          py: 1,
                          px: 2,
                          flex: 1,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                          }
                        }}
                      >
                        Lock Property
                      </Button>
                    )}

                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => handleInterestedClick(property)} 
                      disabled={isLocked && !isLockedByMe && !isBuilder}
                      className="btn-animate"
                      sx={{ 
                        flex: 1,
                        fontSize: '0.75rem',
                        py: 1,
                        px: 2
                      }}
                    >
                      I'm Interested
                    </Button>
                  </Box>

                  {/* Secondary Actions */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ShareIcon />}
                      variant="outlined"
                      onClick={() => handleShareClick(property)}
                      disabled={isLocked && !isLockedByMe && !isBuilder}
                      sx={{ 
                        fontSize: '0.7rem',
                        py: 0.75,
                        px: 1
                      }}
                    >
                      Share
                    </Button>
                    
                    <Button
                      size="small"
                      startIcon={<GroupIcon />}
                      variant="outlined"
                      onClick={() => handleGroupMatch(property)}
                      disabled={groupLoading || (isLocked && !isLockedByMe && !isBuilder)}
                      sx={{ 
                        fontSize: '0.7rem',
                        py: 0.75,
                        px: 1
                      }}
                    >
                      Group
                    </Button>
                    
                    <Button
                      size="small"
                      startIcon={<MailOutlineIcon />}
                      variant="outlined"
                      onClick={() => handleMessageSeller(property)}
                      disabled={isLocked && !isLockedByMe && !isBuilder}
                      sx={{ 
                        fontSize: '0.7rem',
                        py: 0.75,
                        px: 1
                      }}
                    >
                      Message
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {properties.length === 0 && (
        <Box sx={{ 
          p: 8, 
          textAlign: 'center',
          color: '#64748B',
          background: 'white',
          borderRadius: 3,
          border: '1px solid #E2E8F0'
        }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            No Properties Available
          </Typography>
          <Typography variant="body1">
            Check back later for new property listings.
          </Typography>
        </Box>
      )}

      {groupError && <Typography color="error" sx={{ mt: 2 }}>{groupError}</Typography>}
      {groupSuccess && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {groupSuccess} <Button onClick={() => navigate('/groups')}>Go to Your Groups</Button>
        </Typography>
      )}

      {/* Interest Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Express Your Interest</DialogTitle>
        <DialogContent>
          <TextField
            label="Describe your interest"
            value={interestDescription}
            onChange={e => setInterestDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            autoFocus
            placeholder="E.g. We are a couple with $80K budget, open to co-ownership..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDialogSubmit} variant="contained" disabled={loading || !interestDescription.trim()}>
            {loading ? 'Saving...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Property</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <Button startIcon={<ContentCopyIcon />} onClick={handleCopyLink} variant="outlined" fullWidth>
              Copy Link
            </Button>
            {copySuccess && <Typography color="success.main">{copySuccess}</Typography>}
            <Button startIcon={<WhatsAppIcon />} onClick={handleWhatsAppShare} variant="outlined" fullWidth sx={{ color: '#25D366', borderColor: '#25D366' }}>
              Share to WhatsApp
            </Button>
            <Button startIcon={<TelegramIcon />} onClick={handleTelegramShare} variant="outlined" fullWidth sx={{ color: '#229ED9', borderColor: '#229ED9' }}>
              Share to Telegram
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Group Match Chat Dialog */}
      <Dialog 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          Group Chat: {chatProperty?.title}
        </DialogTitle>
        <DialogContent dividers sx={{ 
          minHeight: 400, 
          maxHeight: 500, 
          overflowY: 'auto',
          p: 3,
          background: 'white'
        }}>
          {messages.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: '#64748B'
            }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Start the conversation!
              </Typography>
              <Typography variant="body2">
                Be the first to share your thoughts about this property.
              </Typography>
            </Box>
          )}
          {messages.map((msg) => (
            <Box 
              key={msg.id} 
              sx={{ 
                mb: 2, 
                display: 'flex',
                justifyContent: msg.user_id === user?.id ? 'flex-end' : 'flex-start'
              }}
            >
              <Box
                className={`message-bubble ${msg.user_id === user?.id ? 'sent' : 'received'}`}
                sx={{
                  maxWidth: '70%',
                  position: 'relative'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    mb: 0.5,
                    opacity: 0.8
                  }}
                >
                  {msg.user_name || msg.user_email}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                  {msg.message}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.6,
                    fontSize: '0.7rem'
                  }}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          background: 'white',
          borderTop: '1px solid #E2E8F0'
        }}>
          <TextField
            size="medium"
            fullWidth
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSendMessage(); }}
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: '#F8FAFC'
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSendMessage} 
            disabled={sending || !newMessage.trim()}
            className="btn-animate"
            sx={{
              ml: 2,
              px: 3,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              }
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Seller Dialog */}
      <Dialog 
        open={messageDialogOpen} 
        onClose={() => setMessageDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          Message Seller
        </DialogTitle>
        <DialogContent dividers sx={{ 
          minHeight: 300, 
          maxHeight: 400, 
          overflowY: 'auto',
          p: 3,
          background: 'white'
        }}>
          {messageError && (
            <Typography 
              color="error" 
              sx={{ 
                p: 2, 
                mb: 2,
                background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                borderRadius: 2,
                border: '1px solid #EF4444'
              }}
            >
              {messageError}
            </Typography>
          )}
          {messageLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <Typography sx={{ mt: 2, color: '#64748B' }}>
                Loading conversation...
              </Typography>
            </Box>
          ) : (
            conversation.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                color: '#64748B'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Start a conversation with the seller
                </Typography>
                <Typography variant="body2">
                  Introduce yourself and ask any questions about this property.
                </Typography>
              </Box>
            ) : (
              conversation.map(msg => (
                <Box 
                  key={msg.id} 
                  sx={{ 
                    mb: 2, 
                    display: 'flex',
                    justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box
                    className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                    sx={{
                      maxWidth: '70%',
                      position: 'relative'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        mb: 0.5,
                        opacity: 0.8
                      }}
                    >
                      {msg.sender_id === user.id ? 'You' : 'Seller'}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                      {msg.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.6,
                        fontSize: '0.7rem'
                      }}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Box>
                </Box>
              ))
            )
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          background: 'white',
          borderTop: '1px solid #E2E8F0'
        }}>
          <TextField
            size="medium"
            fullWidth
            placeholder="Type your message to the seller..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !messageLoading) handleSendMessageToSeller(); }}
            disabled={messageLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: '#F8FAFC'
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSendMessageToSeller} 
            disabled={messageLoading || !messageText.trim()}
            className="btn-animate"
            sx={{
              ml: 2,
              px: 3,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            {messageLoading ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lock Agreement Dialog */}
      <Dialog open={lockDialogOpen} onClose={() => setLockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lock Property - Legal Agreement</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            By locking this property, you agree to enter into a serious negotiation with the seller. 
            During the lock period, no other buyers can negotiate for this property. 
            Please review the agreement below:
          </Typography>
          <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2, background: '#fafafa' }}>
            <Typography variant="body2">
              <b>Lock Agreement:</b> I understand that by locking this property, I am entering into an exclusive negotiation with the seller. 
              I agree not to pursue other properties during this period, and I am committed to moving forward with the purchase, subject to financing and due diligence. 
              I acknowledge that the seller may release the lock if I do not proceed in good faith.
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={lockAgreementChecked}
                onChange={e => setLockAgreementChecked(e.target.checked)}
              />
            }
            label="I have read and agree to the terms above"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLockDialogOpen(false)} disabled={lockLoading}>Cancel</Button>
          <Button
            onClick={handleLockAgreement}
            variant="contained"
            color="warning"
            disabled={!lockAgreementChecked || lockLoading}
          >
            {lockLoading ? 'Locking...' : 'Lock Property'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Interest Form */}
      <EnhancedInterestForm
        property={enhancedInterestProperty}
        user={user}
        open={enhancedInterestOpen}
        onClose={() => {
          setEnhancedInterestOpen(false);
          setEnhancedInterestProperty(null);
        }}
        onInterestSubmitted={() => {
          // Refresh interests after submission
          const fetchInterests = async () => {
            const { data, error } = await supabase.from('property_interests').select('*');
            if (!error && data) {
              const grouped = {};
              data.forEach((interest) => {
                if (!grouped[interest.property_id]) grouped[interest.property_id] = [];
                grouped[interest.property_id].push(interest);
              });
              setInterests(grouped);
            }
          };
          fetchInterests();
        }}
      />

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          {loadingProfile ? (
            <Typography>Loading...</Typography>
          ) : selectedProfile ? (
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {selectedProfile.first_name || ''} {selectedProfile.last_name || ''}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography>{selectedProfile.email || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography>{selectedProfile.phone || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography>{selectedProfile.residential_city || 'Not provided'}, {selectedProfile.residential_province || ''}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">User Role</Typography>
                  <Typography>{selectedProfile.user_role || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Account Type</Typography>
                  <Typography>{selectedProfile.account_type || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Investment Capacity</Typography>
                  <Typography>
                    {selectedProfile.budget ? `$${Number(selectedProfile.budget).toLocaleString()}` : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Employment</Typography>
                  <Typography>
                    {selectedProfile.employment_type || 'Not provided'}
                    {selectedProfile.employer_name ? ` at ${selectedProfile.employer_name}` : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Job Title</Typography>
                  <Typography>{selectedProfile.job_title || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                  <Typography>{selectedProfile.bio || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>No profile found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact</DialogTitle>
        <DialogContent>
          <Typography>Contact form coming soon...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={groupChatDialogOpen} onClose={() => setGroupChatDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite to Group Chat</DialogTitle>
        <DialogContent>
          {groupError && <Typography color="error">{groupError}</Typography>}
          {groupSuccess && <Typography color="success.main">{groupSuccess}</Typography>}
          {!groupError && !groupSuccess && (
            <Typography>Sending invitation...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupChatDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
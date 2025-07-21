import { Box, Paper, Button, Typography, Badge } from '@mui/material';
import { useState, useEffect } from 'react';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import PropertyContextPanel from '../components/PropertyContextPanel';
import { supabase } from '../supabaseClient';
import { useLocation } from 'react-router-dom';

export default function Messenger({ user, setMessengerUnread }) {
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [invitationActionLoading, setInvitationActionLoading] = useState(false);
  const [unreadInvitations, setUnreadInvitations] = useState(0);
  const location = useLocation();

  // Read conversationId from URL
  const conversationIdFromUrl = (() => {
    const params = new URLSearchParams(location.search);
    return params.get('conversationId');
  })();

  // Fetch all users for participant display
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('user_profiles').select('id, email');
      setUsers(data || []);
    })();
  }, []);

  // Fetch pending group invitations for this user
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending');
      console.log('Fetched invitations for user', user.id, data, error);
      setInvitations(data || []);
      // Count unread invitations
      const unread = (data || []).filter(inv => !inv.read).length;
      setUnreadInvitations(unread);
      if (typeof setMessengerUnread === 'function') setMessengerUnread(unread);
      // Mark all unread invitations as read
      const unreadIds = (data || []).filter(inv => !inv.read).map(inv => inv.id);
      if (unreadIds.length > 0) {
        await supabase.from('group_invitations').update({ read: true }).in('id', unreadIds);
      }
    })();
  }, [user, invitationActionLoading]);

  // Accept invitation
  async function handleAcceptInvitation(invite) {
    setInvitationActionLoading(true);
    try {
      // Add user as participant
      await supabase.from('conversation_participants').insert({
        conversation_id: invite.group_conversation_id,
        user_id: user.id
      });
      // Update invitation status
      await supabase.from('group_invitations').update({ status: 'accepted' }).eq('id', invite.id);
      // Fetch the group conversation and set as selected
      const { data: conv, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', invite.group_conversation_id)
        .single();
      if (conv) {
        // Fetch property info
        let property = null;
        if (conv.property_id) {
          const { data: prop } = await supabase
            .from('properties')
            .select('id, title, photo_url, address_city, address_street, address_street_num')
            .eq('id', conv.property_id)
            .single();
          property = prop;
        }
        // Fetch participants
        const { data: allParts } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .eq('conversation_id', conv.id);
        const participants = allParts ? allParts.map(p => p.user_id) : [];
        setSelected({ ...conv, property, participants });
      }
    } finally {
      setInvitationActionLoading(false);
    }
  }
  // Decline invitation
  async function handleDeclineInvitation(invite) {
    setInvitationActionLoading(true);
    try {
      await supabase.from('group_invitations').update({ status: 'declined' }).eq('id', invite.id);
    } finally {
      setInvitationActionLoading(false);
    }
  }

  // Auto-select conversation if conversationId is in URL
  useEffect(() => {
    if (!conversationIdFromUrl) return;
    // Fetch the conversation and set as selected
    (async () => {
      const { data: conv, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationIdFromUrl)
        .single();
      if (!conv) return;
      // Fetch property info
      let property = null;
      if (conv.property_id) {
        const { data: prop } = await supabase
          .from('properties')
          .select('id, title, photo_url, address_city, address_street, address_street_num')
          .eq('id', conv.property_id)
          .single();
        property = prop;
      }
      // Fetch participants
      const { data: allParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .eq('conversation_id', conv.id);
      const participants = allParts ? allParts.map(p => p.user_id) : [];
      setSelected({ ...conv, property, participants });
    })();
  }, [conversationIdFromUrl]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 500, gap: 2 }}>
      {/* Invitations notification area */}
      {invitations.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, background: '#FEF3C7', border: '1px solid #F59E0B' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Group Chat Invitations
          </Typography>
          {invitations.map(invite => (
            <Box key={invite.id} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>
                You were invited to join the group chat for <b>{invite.properties?.title || 'a property'}</b>.
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={invitationActionLoading}
                onClick={() => handleAcceptInvitation(invite)}
              >
                Accept
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={invitationActionLoading}
                onClick={() => handleDeclineInvitation(invite)}
              >
                Decline
              </Button>
            </Box>
          ))}
        </Paper>
      )}
      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        {/* Left: Conversation List */}
        <Paper sx={{ width: 260, overflow: 'auto' }}>
          <ConversationList user={user} selected={selected} setSelected={setSelected} />
        </Paper>
        {/* Center: Chat Thread */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <ChatWindow user={user} conversation={selected} />
        </Paper>
        {/* Right: Context Panel */}
        <Paper sx={{ width: 260, p: 2 }}>
          <PropertyContextPanel
            property={selected?.property}
            participants={selected?.participants}
            users={users}
          />
        </Paper>
      </Box>
    </Box>
  );
} 
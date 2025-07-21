import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, CardActions, TextField, Divider, Paper } from '@mui/material';
import { supabase } from '../supabaseClient';
import { useRef } from 'react';

function GroupChat({ group, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  // Fetch messages for this group
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      if (firstLoad.current) setLoading(true);
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });
      if (!error && isMounted) setMessages(data || []);
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    };
    fetchMessages();
    // Poll for new messages every 3s
    const interval = setInterval(fetchMessages, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [group.id]);

  // Send a new message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const userName = (user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : user.email;
    const { error } = await supabase.from('group_messages').insert([{
      group_id: group.id,
      user_id: user.id,
      user_name: userName, // <-- store real name if available
      message: newMessage,
    }]);
    setSending(false);
    setNewMessage('');
    // Refetch messages
    const { data } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  return (
    <Paper sx={{ mt: 2, p: 2, background: '#f8fafb' }}>
      <Typography variant="subtitle1" gutterBottom>Group Chat</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ minHeight: 120, maxHeight: 300, overflowY: 'auto', mb: 2 }}>
        {loading ? (
          <Typography color="text.secondary">Loading messages...</Typography>
        ) : messages.length === 0 ? (
          <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
        ) : (
          messages.map((msg) => (
            <Box key={msg.id} sx={{ mb: 2, textAlign: msg.user_id === user.id ? 'right' : 'left' }}>
              <Typography variant="body2" color={msg.user_id === user.id ? 'primary' : 'text.secondary'}>
                <b>{msg.user_id === user.id ? 'You' : (msg.user_name || msg.user_email || 'User')}:</b> {msg.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(msg.created_at).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSend(); }}
          disabled={sending}
        />
        <Button variant="contained" onClick={handleSend} disabled={sending || !newMessage.trim()}>
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default function Groups({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChatGroupId, setOpenChatGroupId] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      // 1. Get group memberships for this user
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError || !memberships) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const groupIds = memberships.map(m => m.group_id);
      if (groupIds.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      // 2. Get group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, title, created_at')
        .in('id', groupIds)
        .order('created_at', { ascending: false });

      setGroups(groupData || []);
      setLoading(false);
    };

    fetchGroups();
  }, [user.id]);

  return (
    <Box>
      <Typography variant="h4" mb={2}>Your Groups</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : groups.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          You are not a member of any groups yet.
        </Typography>
      ) : (
      <Grid container spacing={3}>
          {groups.map((group) => (
          <Grid item xs={12} md={6} key={group.id}>
            <Card>
              <CardContent>
                  <Typography variant="h6">{group.title}</Typography>
              </CardContent>
              <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setOpenChatGroupId(openChatGroupId === group.id ? null : group.id)}
                  >
                    {openChatGroupId === group.id ? 'Close Group Chat' : 'Open Group Chat'}
                  </Button>
              </CardActions>
                {openChatGroupId === group.id && (
                  <GroupChat group={group} user={user} />
                )}
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
    </Box>
  );
} 
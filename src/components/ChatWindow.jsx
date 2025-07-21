import { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Avatar } from '@mui/material';
import { supabase } from '../supabaseClient';

export default function ChatWindow({ user, conversation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages for this conversation
  useEffect(() => {
    if (!conversation) return;
    setLoading(true);
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();
    // Poll for new messages every 3s
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [conversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;
    setSending(true);
    const userName = (user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : user.email;
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      user_name: userName, // <-- store real name if available
      message: input.trim(),
    });
    setInput('');
    setSending(false);
    // Refetch messages
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  if (!conversation) return <Box p={2}><Typography>Select a conversation</Typography></Box>;
  if (loading) return <Box p={2}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 1 }}>
        {messages.length === 0 ? (
          <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
        ) : messages.map((msg, i) => (
          <Box key={msg.id} sx={{ mb: 1, textAlign: msg.sender_id === user.id ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
            {msg.sender_id !== user.id && (
              <Avatar src={msg.user_photo_url} sx={{ width: 28, height: 28 }}>
                {msg.user_name ? msg.user_name[0] : (msg.user_email ? msg.user_email[0] : 'U')}
              </Avatar>
            )}
            <Box>
              <Typography variant="body2" color={msg.sender_id === user.id ? 'primary' : 'text.secondary'}>
                <b>{msg.sender_id === user.id ? 'You' : (msg.user_name || msg.user_email || 'Them')}:</b> {msg.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(msg.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSend(); }}
          disabled={sending}
        />
        <Button variant="contained" disabled={!input || sending} onClick={handleSend}>Send</Button>
      </Box>
    </Box>
  );
} 
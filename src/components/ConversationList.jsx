import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Avatar, Box, Typography, CircularProgress } from '@mui/material';
import { supabase } from '../supabaseClient';

export default function ConversationList({ user, selected, setSelected }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch all conversations for the user
    (async () => {
      // Get all conversation_participants for this user
      const { data: parts, error: partErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
      if (partErr || !parts) { setConversations([]); setLoading(false); return; }
      const convIds = parts.map(p => p.conversation_id);
      if (convIds.length === 0) { setConversations([]); setLoading(false); return; }
      // Fetch conversations
      const { data: convs, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convIds)
        .order('created_at', { ascending: false });
      if (convErr || !convs) { setConversations([]); setLoading(false); return; }
      // Fetch property info for each conversation
      const propertyIds = convs.map(c => c.property_id);
      let properties = [];
      if (propertyIds.length > 0) {
        const { data: props } = await supabase
          .from('properties')
          .select('id, title, photo_url, address_city, address_street, address_street_num')
          .in('id', propertyIds);
        properties = props || [];
      }
      // Fetch participants for each conversation
      const { data: allParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id');
      // Compose conversation list
      const convList = convs.map(conv => {
        const prop = properties.find(p => p.id === conv.property_id);
        const participants = allParts
          .filter(p => p.conversation_id === conv.id)
          .map(p => p.user_id);
        return {
          ...conv,
          property: prop,
          participants,
        };
      });
      setConversations(convList);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress /></Box>;
  if (conversations.length === 0) return <Box sx={{ p: 2, textAlign: 'center' }}><Typography>No conversations yet</Typography></Box>;

  return (
    <List>
      {conversations.map(conv => (
        <ListItem
          button
          key={conv.id}
          selected={selected?.id === conv.id}
          onClick={() => setSelected(conv)}
        >
          {conv.property && (
            <Avatar src={conv.property.photo_url} sx={{ mr: 2 }}>
              {conv.property.title?.[0]}
            </Avatar>
          )}
          <ListItemText
            primary={conv.property ? conv.property.title : 'Property'}
            secondary={
              conv.property
                ? `${conv.property.address_street_num || ''} ${conv.property.address_street || ''} ${conv.property.address_city || ''}`
                : ''
            }
          />
        </ListItem>
      ))}
    </List>
  );
} 
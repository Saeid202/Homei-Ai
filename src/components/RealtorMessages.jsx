import { useState } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, Divider, Paper, 
  TextField, Button, ListItemAvatar, Avatar, Chip, Badge 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const mockProperties = [
  { 
    id: 1, 
    title: '123 Maple St, Toronto', 
    interested: [
      { id: 1, name: 'Jane D.', email: 'jane@email.com', status: 'approved', unread: 2 },
      { id: 2, name: 'Alex P.', email: 'alex@email.com', status: 'pending', unread: 0 },
      { id: 3, name: 'Sam K.', email: 'sam@email.com', status: 'approved', unread: 1 },
    ] 
  },
  { 
    id: 2, 
    title: '456 Oak Ave, Toronto', 
    interested: [
      { id: 4, name: 'Maria L.', email: 'maria@email.com', status: 'approved', unread: 0 },
    ] 
  },
];

const mockMessages = {
  1: [
    { from: 'Jane D.', text: 'Hi! I\'m very interested in the Maple St property. Can I schedule a viewing?', time: '10:30 AM' },
    { from: 'You', text: 'Absolutely! I have availability this weekend. What works best for you?', time: '10:32 AM' },
    { from: 'Jane D.', text: 'Saturday afternoon would be perfect. Around 2 PM?', time: '10:35 AM' },
    { from: 'Jane D.', text: 'Also, is the price negotiable?', time: '10:36 AM' },
  ],
  2: [
    { from: 'Alex P.', text: 'Hi there! I saw your listing for Maple St. Is it still available?', time: '9:15 AM' },
    { from: 'You', text: 'Yes, it\'s still available! Would you like to know more details?', time: '9:20 AM' },
  ],
  3: [
    { from: 'Sam K.', text: 'I\'m interested in the Maple St property. Can you send me the property details?', time: '11:00 AM' },
    { from: 'You', text: 'Of course! I\'ll send you the complete property package right away.', time: '11:05 AM' },
  ],
  4: [
    { from: 'Maria L.', text: 'Hi! I love the Oak Ave property. When can I see it?', time: '2:30 PM' },
    { from: 'You', text: 'Great choice! I have several viewing slots available this week.', time: '2:35 PM' },
  ],
};

export default function RealtorMessages() {
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]);
  const [selectedUser, setSelectedUser] = useState(selectedProperty.interested[0]);
  const [input, setInput] = useState('');
  const messages = mockMessages[selectedUser.id] || [];

  const handleSend = () => {
    if (input.trim()) {
      // Mock send message
      console.log('Sending message:', input);
      setInput('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 600, gap: 2 }}>
      {/* Left: Property List */}
      <Paper sx={{ width: 250, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          My Properties
        </Typography>
        <List>
          {mockProperties.map((prop) => (
            <ListItem 
              button 
              selected={selectedProperty.id === prop.id} 
              onClick={() => { 
                setSelectedProperty(prop); 
                setSelectedUser(prop.interested[0]); 
              }} 
              key={prop.id}
            >
              <ListItemText 
                primary={prop.title}
                secondary={`${prop.interested.length} interested`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Center: Interested Users */}
      <Paper sx={{ width: 200, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Interested Buyers
        </Typography>
        <List>
          {selectedProperty.interested.map((user) => (
            <ListItem 
              button 
              selected={selectedUser.id === user.id} 
              onClick={() => setSelectedUser(user)} 
              key={user.id}
            >
              <ListItemAvatar>
                <Badge badgeContent={user.unread} color="error">
                  <Avatar>{user.name[0]}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText 
                primary={user.name}
                secondary={
                  <Box>
                    <Chip 
                      label={user.status} 
                      color={getStatusColor(user.status)}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Right: Chat Thread */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{selectedUser.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedUser.email} • {selectedProperty.title}
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {messages.map((msg, i) => (
            <Box 
              key={i} 
              sx={{ 
                mb: 2, 
                textAlign: msg.from === 'You' ? 'right' : 'left',
                display: 'flex',
                justifyContent: msg.from === 'You' ? 'flex-end' : 'flex-start'
              }}
            >
              <Box 
                sx={{ 
                  maxWidth: '70%',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: msg.from === 'You' ? 'primary.main' : 'grey.100',
                  color: msg.from === 'You' ? 'white' : 'text.primary'
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                  {msg.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <Button 
              variant="contained" 
              disabled={!input.trim()} 
              onClick={handleSend}
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 
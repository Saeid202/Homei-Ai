import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, CardActions, Tabs, Tab, TextField, Paper } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

// Remove initialOpportunities, use backend
export default function Opportunities({ user }) {
  const [tab, setTab] = useState(0);
  const [opportunities, setOpportunities] = useState([]);
  const [form, setForm] = useState({
    type: 'residential',
    title: '',
    property_address: '',
    description: '',
  });
  const [formError, setFormError] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const navigate = useNavigate();
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [groupSuccess, setGroupSuccess] = useState('');
  // Comments state
  const [comments, setComments] = useState({}); // { opportunityId: [comment, ...] }
  const [commentText, setCommentText] = useState({}); // { opportunityId: text }
  const [commentLoading, setCommentLoading] = useState({}); // { opportunityId: bool }
  const [messageLoading, setMessageLoading] = useState(false);

  // Fetch opportunities from Supabase
  useEffect(() => {
    const fetchOpportunities = async () => {
      const { data, error } = await supabase
        .from('co_investment_opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setOpportunities(data || []);
    };
    fetchOpportunities();
  }, []);

  // Fetch comments for all opportunities
  useEffect(() => {
    async function fetchAllComments() {
      const { data, error } = await supabase
        .from('opportunity_comments')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) {
        // Group by opportunity_id
        const grouped = {};
        data.forEach((comment) => {
          if (!grouped[comment.opportunity_id]) grouped[comment.opportunity_id] = [];
          grouped[comment.opportunity_id].push(comment);
        });
        setComments(grouped);
      }
    }
    fetchAllComments();
  }, [opportunities]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.property_address || !form.description) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError('');
    // Insert into Supabase
    const { data, error } = await supabase
      .from('co_investment_opportunities')
      .insert([{
        user_id: user.id,
        type: form.type,
        title: form.title,
        property_address: form.property_address,
        description: form.description,
      }])
      .select()
      .single();
    if (error) {
      setFormError('Error posting opportunity: ' + error.message);
      return;
    }
    setOpportunities((prev) => [data, ...prev]);
    setForm({
      type: 'residential',
      title: '',
      property_address: '',
      description: '',
    });
  };

  const handleShareClick = (opp) => {
    setSharePost(opp);
    setShareDialogOpen(true);
    setCopySuccess('');
  };

  const handleCopyLink = () => {
    if (!sharePost) return;
    const link = `${window.location.origin}/opportunity/${sharePost.id}`;
    navigator.clipboard.writeText(link);
    setCopySuccess('Link copied!');
  };

  const handleWhatsAppShare = () => {
    if (!sharePost) return;
    const link = `${window.location.origin}/opportunity/${sharePost.id}`;
    const text = encodeURIComponent(
      `Check out this investment opportunity: ${sharePost.title} - ${sharePost.property_address}\n${sharePost.description}\n${link}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    if (!sharePost) return;
    const link = `${window.location.origin}/opportunity/${sharePost.id}`;
    const text = encodeURIComponent(
      `Check out this investment opportunity: ${sharePost.title} - ${sharePost.property_address}\n${sharePost.description}\n${link}`
    );
    window.open(`https://t.me/share/url?url=${link}&text=${text}`, '_blank');
  };

  // Group Match handler
  const handleGroupMatch = async (opp) => {
    setGroupLoading(true);
    setGroupError('');
    setGroupSuccess('');
    try {
      // 1. Check if group exists for this opportunity
      let { data: group, error } = await supabase
        .from('groups')
        .select('*')
        .eq('opportunity_id', opp.id)
        .single();

      // 2. If not, create it
      if (!group) {
        const { data: newGroup, error: createError } = await supabase
          .from('groups')
          .insert([{
            opportunity_id: opp.id,
            title: opp.title,
            created_by: user.id,
          }])
          .select()
          .single();
        if (createError) throw createError;
        group = newGroup;
      }

      // 3. Add user as a member if not already
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (!existingMember) {
        const { error: memberError } = await supabase
          .from('group_members')
          .insert([{ group_id: group.id, user_id: user.id }]);
        if (memberError) throw memberError;
      }

      setGroupSuccess('Group created! Go to Your Groups to chat.');
    } catch (err) {
      setGroupError('Could not join or create group: ' + (err.message || err));
    } finally {
      setGroupLoading(false);
    }
  };

  // Handle posting a comment
  const handlePostComment = async (opportunityId) => {
    if (!user || !commentText[opportunityId]?.trim()) return;
    setCommentLoading((prev) => ({ ...prev, [opportunityId]: true }));
    await supabase.from('opportunity_comments').insert({
      opportunity_id: opportunityId,
      user_id: user.id,
      comment_text: commentText[opportunityId],
    });
    setCommentText((prev) => ({ ...prev, [opportunityId]: '' }));
    // Refetch comments
    const { data, error } = await supabase
      .from('opportunity_comments')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: true });
    setComments((prev) => ({ ...prev, [opportunityId]: data || [] }));
    setCommentLoading((prev) => ({ ...prev, [opportunityId]: false }));
  };

  // Handle direct message to opportunity creator
  const handleMessageCreator = async (opp) => {
    if (!user || !opp.user_id || user.id === opp.user_id) return;
    setMessageLoading(true);
    // 1. Check if a direct conversation exists for this opportunity and these two users
    let { data: conv, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('opportunity_id', opp.id)
      .eq('is_group', false)
      .single();
    if (!conv) {
      // Create conversation
      const { data: newConv, error: createErr } = await supabase
        .from('conversations')
        .insert([{ opportunity_id: opp.id, is_group: false }])
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
    if (!participantIds.includes(opp.user_id)) {
      await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: opp.user_id });
    }
    setMessageLoading(false);
    // Redirect to Messenger and select this conversation
    navigate(`/messenger?conversationId=${conv.id}`);
  };

  const filteredOpportunities = opportunities.filter(
    (opp) => (tab === 0 ? opp.type === 'residential' : opp.type === 'commercial')
  );

  return (
    <Box>
      <Typography variant="h4" mb={2}>Opportunities</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Post a New Investment Opportunity</Typography>
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Type"
                name="type"
                value={form.type}
                onChange={handleFormChange}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="residential">Residential Real Estate Investment</option>
                <option value="commercial">Commercial Real Estate Investment</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Property Address"
                name="property_address"
                value={form.property_address}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                minRows={2}
                required
              />
            </Grid>
            <Grid item xs={12} display="flex" alignItems="center">
              <Button type="submit" variant="contained" sx={{ mt: { xs: 2, sm: 0 } }}>Post Opportunity</Button>
              {formError && <Typography color="error" sx={{ ml: 2 }}>{formError}</Typography>}
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Residential Real Estate Investment" />
          <Tab label="Commercial Real Estate Investment" />
        </Tabs>
      </Paper>
      <Grid container spacing={3}>
        {filteredOpportunities.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
              No opportunities found for this category.
            </Typography>
          </Grid>
        ) : (
          filteredOpportunities.map((opp) => (
            <Grid item xs={12} md={6} key={opp.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{opp.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{opp.property_address}</Typography>
                  <Typography>{opp.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<ShareIcon />} onClick={() => handleShareClick(opp)}>Share</Button>
                  <Button
                    size="small"
                    startIcon={<GroupIcon />}
                    onClick={() => handleGroupMatch(opp)}
                    disabled={groupLoading}
                  >
                    Group Match
                  </Button>
                  {user && user.id !== opp.user_id && (
                    <Button
                      size="small"
                      startIcon={<MailOutlineIcon />}
                      onClick={() => handleMessageCreator(opp)}
                      disabled={messageLoading}
                    >
                      Message
                    </Button>
                  )}
                </CardActions>
                {/* Comments Section */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
                  <Box sx={{ maxHeight: 120, overflowY: 'auto', mb: 1 }}>
                    {(comments[opp.id] || []).length === 0 ? (
                      <Typography color="text.secondary" fontSize={14}>No comments yet.</Typography>
                    ) : (
                      comments[opp.id].map((comment) => (
                        <Box key={comment.id} sx={{ mb: 1 }}>
                          <Typography fontSize={13} fontWeight={600}>{comment.user_id}</Typography>
                          <Typography fontSize={14}>{comment.comment_text}</Typography>
                          <Typography fontSize={11} color="text.secondary">{new Date(comment.created_at).toLocaleString()}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                  {user && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Add a comment..."
                        value={commentText[opp.id] || ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [opp.id]: e.target.value }))}
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={3}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handlePostComment(opp.id)}
                        disabled={commentLoading[opp.id] || !(commentText[opp.id] && commentText[opp.id].trim())}
                        sx={{ minWidth: 80 }}
                      >
                        {commentLoading[opp.id] ? 'Posting...' : 'Post'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      {groupError && <Typography color="error" sx={{ mt: 2 }}>{groupError}</Typography>}
      {groupSuccess && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {groupSuccess} <Button onClick={() => navigate('/groups')}>Go to Your Groups</Button>
        </Typography>
      )}
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Opportunity</DialogTitle>
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
    </Box>
  );
} 
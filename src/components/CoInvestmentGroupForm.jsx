import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Group,
  AttachMoney,
  Person,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';

export default function CoInvestmentGroupForm({ property, user, open, onClose, onGroupCreated }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interestedParties, setInterestedParties] = useState([]);
  const [profiles, setProfiles] = useState({});
  
  const [groupData, setGroupData] = useState({
    group_name: '',
    max_investors: 10,
    min_investment: '',
    total_investment_target: property?.price || 0,
    selected_members: [],
    description: ''
  });

  const steps = ['Group Setup', 'Select Members', 'Review & Create'];

  // Fetch interested parties for this property
  useEffect(() => {
    if (open && property) {
      const fetchInterestedParties = async () => {
        const { data: interests } = await supabase
          .from('property_interests')
          .select('*')
          .eq('property_id', property.id)
          .order('created_at', { ascending: false });

        setInterestedParties(interests || []);

        // Fetch profiles for users who opted to show them
        const userIds = interests
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

      fetchInterestedParties();
    }
  }, [open, property]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    setError('');

    try {
      // Create co-investment group
      const { data: group, error: groupError } = await supabase
        .from('co_investment_groups')
        .insert([{
          property_id: property.id,
          group_name: groupData.group_name,
          lead_investor_id: user.id,
          max_investors: groupData.max_investors,
          min_investment: groupData.min_investment ? parseFloat(groupData.min_investment) : null,
          total_investment_target: parseFloat(groupData.total_investment_target),
          description: groupData.description
        }])
        .select()
        .single();

      if (groupError) {
        throw groupError;
      }

      // Add selected members to the group
      if (groupData.selected_members.length > 0) {
        const memberData = groupData.selected_members.map(memberId => {
          const interest = interestedParties.find(p => p.user_id === memberId);
          return {
            group_id: group.id,
            user_id: memberId,
            investment_amount: interest?.investment_amount || 0,
            role: interest?.preferred_role || 'co_investor',
            status: 'pending'
          };
        });

        const { error: memberError } = await supabase
          .from('group_members')
          .insert(memberData);

        if (memberError) {
          throw memberError;
        }
      }

      // Reset form
      setGroupData({
        group_name: '',
        max_investors: 10,
        min_investment: '',
        total_investment_target: property?.price || 0,
        selected_members: [],
        description: ''
      });
      setActiveStep(0);
      
      onGroupCreated && onGroupCreated(group);
      onClose();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return groupData.group_name.trim().length > 0 && 
               groupData.total_investment_target > 0;
      case 1:
        return true; // Member selection is optional
      case 2:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderGroupSetup = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Create Co-Investment Group
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Set up the parameters for your co-investment group. You'll be the lead investor.
      </Typography>

      <Grid container spacing={3}>
                <Grid xs={12}>
          <TextField
            label="Group Name"
            value={groupData.group_name}
            onChange={(e) => setGroupData({...groupData, group_name: e.target.value})}
            fullWidth
            placeholder="e.g., Downtown Condo Investment Group"
            helperText="Choose a descriptive name for your investment group"
          />
        </Grid>
        
        <Grid xs={12}>
          <TextField
            label="Group Description"
            value={groupData.description}
            onChange={(e) => setGroupData({...groupData, description: e.target.value})}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe the investment strategy, timeline, and goals..."
            helperText="Help potential co-investors understand the investment approach"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            label="Maximum Investors"
            type="number"
            value={groupData.max_investors}
            onChange={(e) => setGroupData({...groupData, max_investors: parseInt(e.target.value)})}
            fullWidth
            inputProps={{ min: 2, max: 20 }}
            helperText="How many co-investors can join?"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            label="Minimum Investment ($)"
            type="number"
            value={groupData.min_investment}
            onChange={(e) => setGroupData({...groupData, min_investment: e.target.value})}
            fullWidth
            InputProps={{
              startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            helperText="Minimum amount each investor must contribute"
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            label="Total Investment Target ($)"
            type="number"
            value={groupData.total_investment_target}
            onChange={(e) => setGroupData({...groupData, total_investment_target: e.target.value})}
            fullWidth
            InputProps={{
              startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            helperText="Total amount needed to complete the investment"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderMemberSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Group Members
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose from interested parties to invite to your co-investment group.
      </Typography>

      {interestedParties.length === 0 ? (
        <Alert severity="info">
          No interested parties found for this property yet. You can create the group and invite members later.
        </Alert>
      ) : (
        <List>
          {interestedParties.map(party => {
            const profile = profiles[party.user_id];
            const displayName = party.display_real_name && party.user_name 
              ? party.user_name 
              : party.user_email;
            
            return (
              <Card key={party.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: party.display_real_name ? 'success.main' : 'grey.500'
                      }}>
                        {displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {displayName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          {party.display_real_name && (
                            <Chip 
                              label="Real Name" 
                              size="small" 
                              color="success"
                              sx={{ height: '20px', fontSize: '0.6rem' }}
                            />
                          )}
                          <Chip 
                            label={party.interest_level.replace('_', ' ')} 
                            size="small" 
                            color="primary"
                            sx={{ height: '20px', fontSize: '0.6rem' }}
                          />
                          {party.investment_amount && (
                            <Chip 
                              label={`$${party.investment_amount.toLocaleString()}`} 
                              size="small" 
                              color="success"
                              sx={{ height: '20px', fontSize: '0.6rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {party.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={groupData.selected_members.includes(party.user_id)}
                          onChange={(e) => {
                            const newMembers = e.target.checked
                              ? [...groupData.selected_members, party.user_id]
                              : groupData.selected_members.filter(id => id !== party.user_id);
                            setGroupData({...groupData, selected_members: newMembers});
                          }}
                        />
                      }
                      label=""
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </List>
      )}
    </Box>
  );

  const renderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Group Details
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Group Information
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Name:</strong> {groupData.group_name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Description:</strong> {groupData.description}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Max Investors:</strong> {groupData.max_investors}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Min Investment:</strong> ${groupData.min_investment ? parseFloat(groupData.min_investment).toLocaleString() : 'Not set'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>Investment Target:</strong> ${parseFloat(groupData.total_investment_target).toLocaleString()}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Selected Members ({groupData.selected_members.length})
        </Typography>
        {groupData.selected_members.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No members selected. You can invite members after creating the group.
          </Typography>
        ) : (
          <List dense>
            {groupData.selected_members.map(memberId => {
              const party = interestedParties.find(p => p.user_id === memberId);
              const displayName = party?.display_real_name && party?.user_name 
                ? party.user_name 
                : party?.user_email;
              
              return (
                <ListItem key={memberId}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: party?.display_real_name ? 'success.main' : 'grey.500',
                      width: 32,
                      height: 32,
                      fontSize: '0.75rem'
                    }}>
                      {displayName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={displayName}
                    secondary={`$${party?.investment_amount?.toLocaleString() || 0} • ${party?.preferred_role?.replace('_', ' ')}`}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderGroupSetup();
      case 1:
        return renderMemberSelection();
      case 2:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" gutterBottom>
          Create Co-Investment Group
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={!isStepValid(activeStep) || loading}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleCreateGroup}
            disabled={loading}
            startIcon={<Group />}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 
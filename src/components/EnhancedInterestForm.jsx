import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider
} from '@mui/material';
import {
  Person,
  PersonOff,
  Visibility,
  VisibilityOff,
  Security
} from '@mui/icons-material';
import AttachMoney from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import { supabase } from '../supabaseClient';

const interestLevels = [
  { value: 'interested', label: 'Interested', color: 'default' },
  { value: 'very_interested', label: 'Very Interested', color: 'primary' },
  { value: 'ready_to_invest', label: 'Ready to Invest', color: 'success' }
];

const preferredRoles = [
  { value: 'lead_investor', label: 'Lead Investor', description: 'Take charge of the investment group' },
  { value: 'co_investor', label: 'Co-Investor', description: 'Active participant in decision making' },
  { value: 'passive_investor', label: 'Passive Investor', description: 'Provide capital with minimal involvement' }
];

export default function EnhancedInterestForm({ property, user, open, onClose, onInterestSubmitted, users = [] }) {
  // Early return if property is null or undefined
  if (!property) {
    return null;
  }
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const [interestData, setInterestData] = useState({
    description: '',
    display_real_name: false,
    show_profile_to_others: false,
    interest_level: 'interested',
    investment_amount: '',
    preferred_role: 'co_investor'
  });

  const steps = ['Basic Interest', 'Privacy Settings', 'Investment Details', 'Review & Submit'];

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('Profile')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user's real name if they opted to display it
      let displayName = user?.email;
      if (interestData.display_real_name && userProfile) {
        displayName = `${userProfile.first_name} ${userProfile.last_name}`;
      }
      const { data, error: submitError } = await supabase
        .from('property_interests')
        .insert([{
          property_id: property.id,
          user_id: user.id,
          user_email: user.email,
          user_name: displayName,
          description: interestData.description,
          display_real_name: interestData.display_real_name,
          show_profile_to_others: interestData.show_profile_to_others,
          interest_level: interestData.interest_level,
          investment_amount: interestData.investment_amount ? parseFloat(interestData.investment_amount) : null,
          preferred_role: interestData.preferred_role
        }]);
      if (submitError) {
        throw submitError;
      }
      // Reset form
      setInterestData({
        description: '',
        display_real_name: false,
        show_profile_to_others: false,
        interest_level: 'interested',
        investment_amount: '',
        preferred_role: 'co_investor'
      });
      setActiveStep(0);
      onInterestSubmitted && onInterestSubmitted(data);
      setInviteDialogOpen(true); // Open invite dialog after submit
      // onClose(); // Do not close yet
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Invite logic
  const handleSendInvite = async () => {
    setInviteError('');
    setInviteSuccess('');
    if (!inviteUserId) {
      setInviteError('Please select a user to invite.');
      return;
    }
    try {
      const { error } = await supabase
        .from('group_invitations')
        .insert([{
          property_id: property.id,
          sender_id: user.id,
          receiver_id: inviteUserId,
          status: 'pending'
        }]);
      if (error) throw error;
      setInviteSuccess('Invitation sent successfully!');
      setInviteUserId('');
    } catch (err) {
      setInviteError('Could not send group invitation: ' + err.message);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return true; // Make the interest description optional
      case 1:
        return true; // Privacy settings are optional
      case 2:
        return interestData.investment_amount && parseFloat(interestData.investment_amount) > 0;
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderBasicInterest = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tell us about your interest in this property
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Share your intention and plan in this investment opportunity. This helps the builder and other potential co-investors understand your perspective. Are you going to co-own this property? Or is it a pure investment?
      </Typography>
      
      <TextField
        label="Tell us more about your plan so that we can match you with the right opportunity"
        multiline
        rows={4}
        value={interestData.description}
        onChange={(e) => setInterestData({...interestData, description: e.target.value})}
        fullWidth
        placeholder="e.g., I'm interested in this property because of its location, potential for appreciation, and the opportunity to diversify my investment portfolio..."
      />
    </Box>
  );

  const renderPrivacySettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Privacy & Visibility Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose how much information you want to share with the builder and other interested parties.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={interestData.display_real_name}
              onChange={(e) => setInterestData({...interestData, display_real_name: e.target.checked})}
              icon={<PersonOff />}
              checkedIcon={<Person />}
            />
          }
          label={
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Display my real name
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Show "{userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Your Name'}" instead of your email
              </Typography>
            </Box>
          }
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={interestData.show_profile_to_others}
              onChange={(e) => setInterestData({...interestData, show_profile_to_others: e.target.checked})}
              icon={<VisibilityOff />}
              checkedIcon={<Visibility />}
            />
          }
          label={
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Allow others to view my profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Let other interested parties see your contact information and background
              </Typography>
            </Box>
          }
        />
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> The builder will always be able to see your interest details to help facilitate the investment process.
        </Typography>
      </Alert>
    </Box>
  );

  const renderInvestmentDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Investment Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Help us understand your investment preferences and capacity.
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <TextField
            label="Investment Amount ($)"
            type="number"
            value={interestData.investment_amount}
            onChange={(e) => setInterestData({...interestData, investment_amount: e.target.value})}
            fullWidth
            InputProps={{
              startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            helperText="How much are you looking to invest?"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Interest Level</InputLabel>
            <Select 
              value={interestData.interest_level}
              onChange={(e) => setInterestData({...interestData, interest_level: e.target.value})}
              label="Interest Level"
            >
              {interestLevels.map(level => (
                <MenuItem key={level.value} value={level.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={level.label} 
                      size="small" 
                      color={level.color}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Preferred Role in Investment
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {preferredRoles.map(role => (
              <FormControlLabel
                key={role.value}
                control={
                  <Checkbox 
                    checked={interestData.preferred_role === role.value}
                    onChange={(e) => setInterestData({...interestData, preferred_role: role.value})}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {role.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Interest Submission
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Property
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {property.title} - ${property.price?.toLocaleString()}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Your Interest
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {interestData.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={interestLevels.find(l => l.value === interestData.interest_level)?.label}
            color={interestLevels.find(l => l.value === interestData.interest_level)?.color}
          />
          <Chip 
            label={preferredRoles.find(r => r.value === interestData.preferred_role)?.label}
            color="secondary"
          />
          {interestData.investment_amount && (
            <Chip 
              label={`$${parseFloat(interestData.investment_amount).toLocaleString()}`}
              color="success"
            />
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Privacy Settings
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            • Display real name: {interestData.display_real_name ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body2">
            • Show profile to others: {interestData.show_profile_to_others ? 'Yes' : 'No'}
          </Typography>
        </Box>
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
        return renderBasicInterest();
      case 1:
        return renderPrivacySettings();
      case 2:
        return renderInvestmentDetails();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" gutterBottom>
            Express Interest in {property.title}
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
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<GroupIcon />}
            >
              {loading ? 'Submitting...' : 'Submit Interest'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Invite to Group Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogTitle>Invite to Group Chat</DialogTitle>
        <DialogContent>
          <Typography>Select a user to invite to this property group:</Typography>
          {users.filter(u => u.id !== user.id).length > 0 ? (
            <Select
              value={inviteUserId}
              onChange={e => setInviteUserId(e.target.value)}
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            >
              {users.filter(u => u.id !== user.id).map(u => (
                <MenuItem key={u.id} value={u.id}>{u.email}</MenuItem>
              ))}
            </Select>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 2, mb: 2 }}>
              No users available to invite.
            </Typography>
          )}
          {inviteError && <Alert severity="error">{inviteError}</Alert>}
          {inviteSuccess && <Alert severity="success">{inviteSuccess}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleSendInvite} disabled={!inviteUserId}>
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
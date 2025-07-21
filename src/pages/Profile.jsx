import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Paper, Grid, Alert, Container,
  FormControlLabel, Radio, RadioGroup, FormControl, FormLabel, Checkbox,
  Stepper, Step, StepLabel, Divider, Tabs, Tab
} from '@mui/material';
import { supabase } from '../supabaseClient';
import DebugPanel from '../components/DebugPanel';

// Data for dropdowns
const accountTypes = ['Individual Account', 'Corporate Account'];
const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Common Law'];
const canadianProvinces = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 
  'Saskatchewan', 'Yukon'
];
const canadianStatuses = [
  'International Student', 
  'Open Work Permit', 
  'Close Work Permit', 
  'Already Applied for Permanent Residence'
];
const studyLevels = ['Ph.D.', 'Master', 'Bachelor', 'College'];
const employmentTypes = ['Full Time', 'Part Time', 'Self-Employed', 'Unemployed'];
const carFinancingTypes = ['Lease', 'Finance'];

// Countries list (abbreviated for brevity - you can add more)
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh',
  'Belgium', 'Brazil', 'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China',
  'Colombia', 'Costa Rica', 'Croatia', 'Cuba', 'Czech Republic', 'Denmark', 'Ecuador',
  'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana',
  'Greece', 'Guatemala', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Mali', 'Malta', 'Mexico', 'Monaco', 'Mongolia', 'Morocco', 'Myanmar',
  'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'North Korea', 'Norway', 'Pakistan',
  'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia',
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Thailand', 'Tunisia', 'Turkey', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam', 'Yemen', 'Zimbabwe'
];

const initialProfile = {
  // Section 1: Personal Details
  account_type: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  sin: '',
  gender: '',
  marital_status: '',
  email: '',
  phone: '',
  
  // Section 2: Residency & Citizenship
  is_canadian_resident: null,
  country_of_origin: '',
  canadian_status: '',
  university_name: '',
  level_of_study: '',
  study_start_date: '',
  expected_graduation_date: '',
  work_permit_start_date: '',
  work_permit_end_date: '',
  pr_application_date: '',
  employment_end_date: null,         // <--- keep here
  currently_working_here: null,      // <--- keep here
  employment_duration_years: '',   // <--- keep here
  business_duration_years: '',
  
  // Section 3: Address Information
  residential_province: '',
  residential_city: '',
  residential_street_number: '',
  residential_street_name: '',
  residential_postal_code: '',
  residential_unit_number: '',
  mailing_same_as_residential: null,
  mailing_province: '',
  mailing_city: '',
  mailing_street_number: '',
  mailing_street_name: '',
  mailing_postal_code: '',
  mailing_unit_number: '',
  
  // Section 4: Employment and Financial Status
  employment_type: '',
  employer_name: '',
  job_title: '',
  monthly_income: '',
  employment_start_date: '',
  business_name: '',
  business_start_date: '',
  yearly_income: '',
  // Removed duplicates here
  // employment_duration_years: '',
  // currently_working_here: '',
  // employment_end_date: '',
  
  // Section 5: Debt & Financial Obligations
  has_car: null,
  car_make: '',
  car_year: '',
  car_financing_type: '',
  car_lease_start_date: '',
  car_lease_end_date: '',
  car_finance_amount: '',
  has_loan: null,
  
  // Section 6: Investment Capacity
  budget: '',
  owns_real_estate: null,
  comfortable_investment: '',
  
  // Section 7: Backup Plans
  has_emergency_savings: null,
  has_family_backup: null,
  has_property_backup: null,
  
  // Metadata
  profile_completed: false,
  current_section: 1
};

const booleanFields = [
  'is_canadian_resident', 'mailing_same_as_residential', 'has_car', 'has_loan',
  'owns_real_estate', 'has_emergency_savings', 'has_family_backup', 'has_property_backup', 'currently_working_here'
];

const steps = [
  'Personal Details',
  'Residency & Citizenship', 
  'Address Information',
  'Employment & Financial',
  'Debt & Financial Obligations',
  'Investment Capacity',
  'Backup Plans'
];

export default function Profile({ user }) {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          console.log('Loading profile for user:', user.id);
          
          const { data, error } = await supabase
            .from('Profile')
            .select('*')
            .eq('id', user.id)
            .single();
          
          console.log('Load result:', { data, error });
          
          if (data && !error) {
            console.log('Found existing profile:', data);
            // Clean up null values to prevent controlled input warnings
            const cleanedData = Object.fromEntries(
              Object.entries(data).map(([key, value]) => {
                if (booleanFields.includes(key)) return [key, value];
                return [key, value === null ? '' : value];
              })
            );
            setProfile(prev => ({
              ...prev,
              ...cleanedData,
              email: data.email || user.email
            }));
            setActiveStep(data.current_section - 1);
          } else {
            console.log('No existing profile found');
            setProfile(prev => ({
              ...prev,
              email: user.email
            }));
          }
        } catch (err) {
          console.error('Error loading profile:', err);
        }
      }
    };
    
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    if (booleanFields.includes(name)) {
      if (type === 'checkbox') {
        newValue = checked;
      } else if (value === 'true' || value === true) {
        newValue = true;
      } else if (value === 'false' || value === false) {
        newValue = false;
      } else {
        newValue = null;
      }
    }
    setProfile(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setProfile(prev => ({
      ...prev,
      current_section: activeStep + 2
    }));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setProfile(prev => ({
      ...prev,
      current_section: activeStep
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Saving profile for user:', user.id);
      
      // Clean up the data - convert empty strings to null for date fields
      const cleanedProfile = { ...profile };
      const dateFields = [
        'date_of_birth', 'study_start_date', 'expected_graduation_date',
        'work_permit_start_date', 'work_permit_end_date', 'employment_start_date',
        'business_start_date', 'car_lease_start_date', 'car_lease_end_date',
        'employment_end_date', 'pr_application_date'
      ];
      
      dateFields.forEach(field => {
        if (cleanedProfile[field] === '') {
          cleanedProfile[field] = null;
        }
      });
      
      // Convert empty numeric strings to null
      const numericFields = [
        'monthly_income', 'yearly_income', 'car_finance_amount',
        'budget', 'comfortable_investment', 'employment_duration_years',
        'business_duration_years'
      ];
      
      numericFields.forEach(field => {
        if (cleanedProfile[field] === '' || cleanedProfile[field] === null) {
          cleanedProfile[field] = null;
        } else {
          cleanedProfile[field] = parseFloat(cleanedProfile[field]);
        }
      });
      
      const profileData = {
        id: user.id,
        email: user.email,
        user_role: 'seeker',
        ...cleanedProfile,
        profile_completed: true,
        current_section: 7,
        updated_at: new Date().toISOString()
      };
      
      console.log('Profile data to save:', profileData);
      
      const { data, error } = await supabase
        .from('Profile')
        .upsert([profileData], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();
      
      console.log('Save result:', { data, error });
      
      if (error) {
        throw error;
      }
      
      setSuccess('Profile completed successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const saveProgress = async () => {
    try {
      if (!user) return;
      
      // Clean up the data - convert empty strings to null for date fields
      const cleanedProfile = { ...profile };
      const dateFields = [
        'date_of_birth', 'study_start_date', 'expected_graduation_date',
        'work_permit_start_date', 'work_permit_end_date', 'employment_start_date',
        'business_start_date', 'car_lease_start_date', 'car_lease_end_date',
        'employment_end_date', 'pr_application_date'
      ];
      
      dateFields.forEach(field => {
        if (cleanedProfile[field] === '') {
          cleanedProfile[field] = null;
        }
      });
      
      // Convert empty numeric strings to null
      const numericFields = [
        'monthly_income', 'yearly_income', 'car_finance_amount',
        'budget', 'comfortable_investment', 'employment_duration_years',
        'business_duration_years'
      ];
      
      numericFields.forEach(field => {
        if (cleanedProfile[field] === '' || cleanedProfile[field] === null) {
          cleanedProfile[field] = null;
        } else {
          cleanedProfile[field] = parseFloat(cleanedProfile[field]);
        }
      });
      
      const profileData = {
        id: user.id,
        email: user.email,
        user_role: 'seeker',
        ...cleanedProfile,
        current_section: activeStep + 1,
        updated_at: new Date().toISOString()
      };
      
      await supabase
        .from('Profile')
        .upsert([profileData], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      setSuccess('Progress saved!');
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Test function
  const testDatabase = async () => {
    try {
      console.log('=== DATABASE TEST ===');
      console.log('User:', user);
      
      // Test both tables
      console.log('Testing user_profiles table...');
      const { data: userProfilesData, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('user_profiles result:', { userProfilesData, userProfilesError });
      
      console.log('Testing Profile table...');
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('Profile result:', { profileData, profileError });
      
      // Test table structure
      console.log('Testing Profile table structure...');
      const { data: structureData, error: structureError } = await supabase
        .from('Profile')
        .select('id')
        .limit(1);
      
      console.log('Profile structure test:', { structureData, structureError });
      
      let message = 'Database Test Results:\n\n';
      
      if (userProfilesError) {
        message += `user_profiles table error: ${userProfilesError.message}\n`;
      } else {
        message += `user_profiles table: OK (${userProfilesData ? 'User found' : 'No user'})\n`;
      }
      
      if (profileError) {
        message += `Profile table error: ${profileError.message}\n`;
      } else {
        message += `Profile table: OK (${profileData ? 'Profile found' : 'No profile'})\n`;
      }
      
      if (structureError) {
        message += `Profile table structure error: ${structureError.message}\n`;
      } else {
        message += `Profile table structure: OK\n`;
      }
      
      alert(message);
    } catch (err) {
      console.error('Test error:', err);
      alert('Test Error: ' + err.message);
    }
  };

  const renderPersonalDetails = () => (
    <Box sx={{ width: '100%', mx: 0, my: 2 }}>
      <Paper elevation={4} sx={{
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafb 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
        width: '100%',
        mx: 0,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3, letterSpacing: -0.5 }}>
          <span style={{ color: '#6366f1', marginRight: 8 }}>1.</span> Personal Details
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {/* Account Type */}
          <Grid item xs={12}>
            <TextField
              select
              label="Type of Investment Account *"
              name="account_type"
              value={profile.account_type}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: '#6366f1', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <span role="img" aria-label="account">💼</span>
                  </Box>
                )
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            >
              <MenuItem value="">Select Account Type</MenuItem>
              {accountTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Name Group */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="First Name *"
              name="first_name"
              value={profile.first_name}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="given-name"
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: '#6366f1', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <span role="img" aria-label="first">👤</span>
                  </Box>
                )
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Middle Name"
              name="middle_name"
              value={profile.middle_name}
              onChange={handleChange}
              fullWidth
              autoComplete="additional-name"
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Last Name *"
              name="last_name"
              value={profile.last_name}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="family-name"
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>

          {/* Demographics */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date of Birth *"
              name="date_of_birth"
              type="date"
              value={profile.date_of_birth}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              helperText="Format: YYYY-MM-DD"
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: '#6366f1', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <span role="img" aria-label="calendar">📅</span>
                  </Box>
                )
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Social Insurance Number (SIN) *"
              name="sin"
              value={profile.sin}
              onChange={handleChange}
              fullWidth
              required
              placeholder="XXX-XXX-XXX"
              helperText="Your SIN is kept confidential."
              inputProps={{ maxLength: 11 }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: '#6366f1', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <span role="img" aria-label="lock">🔒</span>
                  </Box>
                )
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Gender *"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            >
              <MenuItem value="">Select Gender</MenuItem>
              {genders.map(gender => (
                <MenuItem key={gender} value={gender}>{gender}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Marital Status *"
              name="marital_status"
              value={profile.marital_status}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            >
              <MenuItem value="">Select Status</MenuItem>
              {maritalStatuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email Address *"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="email"
              helperText="We'll never share your email."
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: '#6366f1', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <span role="img" aria-label="email">✉️</span>
                  </Box>
                )
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone (e.g., 999-999-9999) *"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              fullWidth
              required
              placeholder="999-999-9999"
              autoComplete="tel"
              helperText="Format: 999-999-9999"
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: '#6366f1', mr: 1, display: 'flex', alignItems: 'center' }}>
                    <span role="img" aria-label="phone">📞</span>
                  </Box>
                )
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderResidencyCitizenship = () => (
    <Box sx={{ width: '100%', mx: 0, my: 2 }}>
      <Paper elevation={4} sx={{
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafb 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
        width: '100%',
        mx: 0,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3, letterSpacing: -0.5 }}>
          <span style={{ color: '#6366f1', marginRight: 8 }}>2.</span> Residency & Citizenship
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Are you a Canadian Permanent Resident or citizen? *</FormLabel>
              <RadioGroup
                name="is_canadian_resident"
                value={profile.is_canadian_resident}
                onChange={handleChange}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          {profile.is_canadian_resident === false && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="What is your status in Canada? *"
                  name="canadian_status"
                  value={profile.canadian_status}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                >
                  <MenuItem value="">Select Status</MenuItem>
                  {canadianStatuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/* International Student */}
              {profile.canadian_status === 'International Student' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="What is the level of your study? *"
                      name="level_of_study"
                      value={profile.level_of_study}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    >
                      <MenuItem value="">Select Level</MenuItem>
                      {studyLevels.map(level => (
                        <MenuItem key={level} value={level}>{level}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Name of your institute *"
                      name="university_name"
                      value={profile.university_name}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date *"
                      name="study_start_date"
                      type="date"
                      value={profile.study_start_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Date (Expected Date) *"
                      name="expected_graduation_date"
                      type="date"
                      value={profile.expected_graduation_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                </>
              )}
              {/* Open Work Permit */}
              {profile.canadian_status === 'Open Work Permit' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date *"
                      name="work_permit_start_date"
                      type="date"
                      value={profile.work_permit_start_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Date *"
                      name="work_permit_end_date"
                      type="date"
                      value={profile.work_permit_end_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                </>
              )}
              {/* Close Work Permit */}
              {profile.canadian_status === 'Close Work Permit' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date *"
                      name="work_permit_start_date"
                      type="date"
                      value={profile.work_permit_start_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Date *"
                      name="work_permit_end_date"
                      type="date"
                      value={profile.work_permit_end_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                </>
              )}
              {/* Already Applied for PR */}
              {profile.canadian_status === 'Already Applied for Permanent Residence' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="When did you apply? *"
                      name="pr_application_date"
                      type="date"
                      value={profile.pr_application_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Where are you from? *"
                      name="country_of_origin"
                      value={profile.country_of_origin}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    >
                      <MenuItem value="">Select Country</MenuItem>
                      {countries.map(country => (
                        <MenuItem key={country} value={country}>{country}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Note:</strong> Please call us regarding your PR residence in Canada and consult with our lawyers.
                      </Typography>
                    </Alert>
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );

  const renderAddressInformation = () => (
    <Box sx={{ width: '100%', mx: 0, my: 2 }}>
      <Paper elevation={4} sx={{
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafb 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
        width: '100%',
        mx: 0,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3, letterSpacing: -0.5 }}>
          <span style={{ color: '#6366f1', marginRight: 8 }}>3.</span> Address Information
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Current Residence Address:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Province *"
              name="residential_province"
              value={profile.residential_province}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            >
              <MenuItem value="">Select Province</MenuItem>
              {canadianProvinces.map(province => (
                <MenuItem key={province} value={province}>{province}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City *"
              name="residential_city"
              value={profile.residential_city}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Street Number *"
              name="residential_street_number"
              value={profile.residential_street_number}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Street Name *"
              name="residential_street_name"
              value={profile.residential_street_name}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Postal Code *"
              name="residential_postal_code"
              value={profile.residential_postal_code}
              onChange={handleChange}
              fullWidth
              required
              placeholder="A1A 1A1"
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Unit Number"
              name="residential_unit_number"
              value={profile.residential_unit_number}
              onChange={handleChange}
              fullWidth
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Mailing Address:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={profile.mailing_same_as_residential}
                  onChange={handleChange}
                  name="mailing_same_as_residential"
                />
              }
              label="The Same as Residential Address"
            />
          </Grid>
          {!profile.mailing_same_as_residential && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Province"
                  name="mailing_province"
                  value={profile.mailing_province}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                >
                  <MenuItem value="">Select Province</MenuItem>
                  {canadianProvinces.map(province => (
                    <MenuItem key={province} value={province}>{province}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  name="mailing_city"
                  value={profile.mailing_city}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Street Number"
                  name="mailing_street_number"
                  value={profile.mailing_street_number}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Street Name"
                  name="mailing_street_name"
                  value={profile.mailing_street_name}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Postal Code"
                  name="mailing_postal_code"
                  value={profile.mailing_postal_code}
                  onChange={handleChange}
                  fullWidth
                  placeholder="A1A 1A1"
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Unit Number"
                  name="mailing_unit_number"
                  value={profile.mailing_unit_number}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );

  const renderEmploymentFinancial = () => (
    <Box sx={{ width: '100%', mx: 0, my: 2 }}>
      <Paper elevation={4} sx={{
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafb 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
        width: '100%',
        mx: 0,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3, letterSpacing: -0.5 }}>
          <span style={{ color: '#6366f1', marginRight: 8 }}>4.</span> Employment and Financial Status
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Current Employment Type *"
              name="employment_type"
              value={profile.employment_type}
              onChange={handleChange}
              fullWidth
              required
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            >
              <MenuItem value="">Select Employment Type</MenuItem>
              {employmentTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          {(profile.employment_type === 'Full Time' || profile.employment_type === 'Part Time') && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employer Name *"
                  name="employer_name"
                  value={profile.employer_name}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Job Title *"
                  name="job_title"
                  value={profile.job_title}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Monthly Income *"
                  name="monthly_income"
                  type="number"
                  value={profile.monthly_income}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
                  }}
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="How long have you been with this employer? *"
                  name="employment_start_date"
                  type="date"
                  value={profile.employment_start_date}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
            </>
          )}
          {profile.employment_type === 'Self-Employed' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="What is your business? *"
                  name="business_name"
                  value={profile.business_name}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="How long have you been in this business? *"
                  name="business_start_date"
                  type="date"
                  value={profile.business_start_date}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Your yearly income? *"
                  name="yearly_income"
                  type="number"
                  value={profile.yearly_income}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
                  }}
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
            </>
          )}
          {profile.employment_type === 'Unemployed' && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employment End Date"
                name="employment_end_date"
                type="date"
                value={profile.employment_end_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  minHeight: 56,
                  fontSize: '1.1rem',
                  '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                  '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                }}
              />
            </Grid>
          )}
          {profile.employment_type !== 'Unemployed' && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employment Duration (Years)"
                name="employment_duration_years"
                type="number"
                value={profile.employment_duration_years}
                onChange={handleChange}
                fullWidth
                required
                sx={{
                  minHeight: 56,
                  fontSize: '1.1rem',
                  '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                  '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                }}
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );

  const renderDebtFinancial = () => (
    <Box sx={{ width: '100%', mx: 0, my: 2 }}>
      <Paper elevation={4} sx={{
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafb 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
        width: '100%',
        mx: 0,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3, letterSpacing: -0.5 }}>
          <span style={{ color: '#6366f1', marginRight: 8 }}>5.</span> Debt & Financial Obligations
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Do you have a car? *</FormLabel>
              <RadioGroup
                name="has_car"
                value={profile.has_car}
                onChange={handleChange}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          {profile.has_car === true && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Make *"
                  name="car_make"
                  value={profile.car_make}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year *"
                  name="car_year"
                  value={profile.car_year}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Is it lease or finance? *"
                  name="car_financing_type"
                  value={profile.car_financing_type}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{
                    minHeight: 56,
                    fontSize: '1.1rem',
                    '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                    '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                  }}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  {carFinancingTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              {profile.car_financing_type === 'Lease' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Date *"
                      name="car_lease_start_date"
                      type="date"
                      value={profile.car_lease_start_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Date *"
                      name="car_lease_end_date"
                      type="date"
                      value={profile.car_lease_end_date}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        minHeight: 56,
                        fontSize: '1.1rem',
                        '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                        '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                      }}
                    />
                  </Grid>
                </>
              )}
              {profile.car_financing_type === 'Finance' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="How much do you owe to the bank? *"
                    name="car_finance_amount"
                    type="number"
                    value={profile.car_finance_amount}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
                    }}
                    sx={{
                      minHeight: 56,
                      fontSize: '1.1rem',
                      '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                      '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
                    }}
                  />
                </Grid>
              )}
            </>
          )}
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Do you have any loan? *</FormLabel>
              <RadioGroup
                name="has_loan"
                value={profile.has_loan}
                onChange={handleChange}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderInvestmentCapacity = () => (
    <Box sx={{ width: '100%', mx: 0, my: 2 }}>
      <Paper elevation={4} sx={{
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafb 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
        width: '100%',
        mx: 0,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3, letterSpacing: -0.5 }}>
          <span style={{ color: '#6366f1', marginRight: 8 }}>6.</span> Investment Capacity
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="How much budget do you currently have? *"
              name="budget"
              type="number"
              value={profile.budget}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Do you currently own any real estate? *</FormLabel>
              <RadioGroup
                name="owns_real_estate"
                value={profile.owns_real_estate}
                onChange={handleChange}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No, I'm a first buyer" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="How much are you comfortable investing in this project (initial capital)? *"
              name="comfortable_investment"
              type="number"
              value={profile.comfortable_investment}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>,
              }}
              sx={{
                minHeight: 56,
                fontSize: '1.1rem',
                '.MuiInputBase-input': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' },
                '.MuiSelect-select': { minHeight: 40, fontSize: '1.1rem', padding: '16px 20px' }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderBackupPlans = () => (
    <Box sx={{ width: '100%', mx: 0, my: 2 }}>
      <Paper elevation={4} sx={{
        p: { xs: 2, sm: 4, md: 5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #f8fafb 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
        width: '100%',
        mx: 0,
      }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3, letterSpacing: -0.5 }}>
          <span style={{ color: '#6366f1', marginRight: 8 }}>7.</span> Backup Plans
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Do you have emergency savings for unexpected expenses? *</FormLabel>
              <RadioGroup
                name="has_emergency_savings"
                value={profile.has_emergency_savings}
                onChange={handleChange}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Do you have any friends or family member who can back you up? *</FormLabel>
              <RadioGroup
                name="has_family_backup"
                value={profile.has_family_backup}
                onChange={handleChange}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Do you have any property backup in your country? *</FormLabel>
              <RadioGroup
                name="has_property_backup"
                value={profile.has_property_backup}
                onChange={handleChange}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderResidencyCitizenship();
      case 2:
        return renderAddressInformation();
      case 3:
        return renderEmploymentFinancial();
      case 4:
        return renderDebtFinancial();
      case 5:
        return renderInvestmentCapacity();
      case 6:
        return renderBackupPlans();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Profile Setup
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Tab Navigation */}
        <Tabs
          value={activeStep}
          onChange={(_e, newValue) => setActiveStep(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          {steps.map((label, idx) => (
            <Tab
              key={label}
              label={<span style={{ fontWeight: 600 }}><span style={{ color: '#6366f1', marginRight: 6 }}>{idx + 1}.</span> {label}</span>}
              sx={{ minWidth: 180, fontSize: '1rem', fontWeight: 600 }}
            />
          ))}
        </Tabs>
        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}
          <Box mt={4} display="flex" alignItems="center" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ minWidth: 120 }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              onClick={saveProgress}
              sx={{ mx: 2, minWidth: 180 }}
            >
              Save Progress
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Completing...' : 'Complete Profile'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
                sx={{ minWidth: 120 }}
              >
                Next
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 
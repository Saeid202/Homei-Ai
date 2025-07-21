import { useState } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Paper, Grid, Stepper, Step, StepLabel, Checkbox, FormControlLabel, Chip, InputLabel, Select, OutlinedInput
} from '@mui/material';
import { supabase } from '../supabaseClient';

const propertyTypes = ['Detached', 'Semi-Detached', 'Townhouse', 'Condo', 'Apartment', 'Duplex', 'Triplex', 'Other'];
const amenitiesList = ['Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Fireplace', 'Laundry', 'Elevator', 'Security', 'Other'];
const statusList = ['Active', 'Pending', 'Sold', 'Off Market'];
const provinces = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon',
];

const steps = ['Property Details', 'Features', 'Media', 'Listing Details'];

const initialListing = {
  type: '',
  title: '',
  description: '',
  price: '',
  address: { province: '', city: '', streetNumber: '', streetName: '', postalCode: '', unitNumber: '' },
  bedrooms: '',
  bathrooms: '',
  size: '',
  amenities: [],
  photos: [],
  status: 'Active',
  availableDate: '',
};

export default function PropertyListingForm({ user }) {
  const [listing, setListing] = useState(initialListing);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      setListing({ ...listing, address: { ...listing.address, [name.split('.')[1]]: value } });
    } else {
      setListing({ ...listing, [name]: value });
    }
  };

  const handleAmenitiesChange = (e) => {
    setListing({ ...listing, amenities: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setListing({ ...listing, photos: files });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);
  const handleSubmit = async (e) => {
    e.preventDefault();

    let photoUrl = null;

    // Upload image to Supabase Storage if provided
    if (listing.photos && listing.photos.length > 0) {
      try {
        const file = listing.photos[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `property-images/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Error uploading image: ' + uploadError.message);
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        photoUrl = urlData.publicUrl;
        console.log('Image uploaded successfully:', photoUrl);
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Error uploading image. Please try again.');
        return;
      }
    }

    // Prepare property data for Supabase
    const propertyData = {
      title: listing.title,
      description: listing.description,
      price: listing.price ? parseFloat(listing.price) : null,
      type: listing.type,
      status: listing.status,
      builder_id: user?.id,
      builder_name: user?.email,
      address_province: listing.address.province,
      address_city: listing.address.city,
      address_street: listing.address.streetName,
      address_street_num: listing.address.streetNumber,
      address_postal_code: listing.address.postalCode,
      address_unit: listing.address.unitNumber,
      bedrooms: listing.bedrooms ? parseInt(listing.bedrooms) : null,
      bathrooms: listing.bathrooms ? parseInt(listing.bathrooms) : null,
      size: listing.size ? parseInt(listing.size) : null,
      amenities: listing.amenities,
      photo_url: photoUrl, // Use the uploaded image URL
      available_date: listing.availableDate || null,
    };

    const { error } = await supabase.from('properties').insert([propertyData]);

    if (!error) {
      setSubmitted(true);
      setListing(initialListing);
      setStep(0);
    } else {
      alert('Error listing property: ' + error.message);
    }
  };

  // Section 1: Property Details
  const renderPropertyDetails = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}><TextField select label="Property Type" name="type" value={listing.type} onChange={handleChange} fullWidth required>{propertyTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField label="Listing Title" name="title" value={listing.title} onChange={handleChange} fullWidth required /></Grid>
      <Grid item xs={12}><TextField label="Description" name="description" value={listing.description} onChange={handleChange} fullWidth multiline rows={3} required /></Grid>
      <Grid item xs={12} sm={6}><TextField label="Price ($)" name="price" value={listing.price} onChange={handleChange} fullWidth required /></Grid>
      <Grid item xs={12} sm={6}><TextField select label="Province" name="address.province" value={listing.address.province} onChange={handleChange} fullWidth>{provinces.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField label="City" name="address.city" value={listing.address.city} onChange={handleChange} fullWidth /></Grid>
      <Grid item xs={12} sm={3}><TextField label="Street Number" name="address.streetNumber" value={listing.address.streetNumber} onChange={handleChange} fullWidth /></Grid>
      <Grid item xs={12} sm={9}><TextField label="Street Name" name="address.streetName" value={listing.address.streetName} onChange={handleChange} fullWidth /></Grid>
      <Grid item xs={12} sm={6}><TextField label="Postal Code" name="address.postalCode" value={listing.address.postalCode} onChange={handleChange} fullWidth /></Grid>
      <Grid item xs={12} sm={6}><TextField label="Unit Number" name="address.unitNumber" value={listing.address.unitNumber} onChange={handleChange} fullWidth /></Grid>
    </Grid>
  );

  // Section 2: Features
  const renderFeatures = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}><TextField label="Bedrooms" name="bedrooms" value={listing.bedrooms} onChange={handleChange} fullWidth required /></Grid>
      <Grid item xs={12} sm={4}><TextField label="Bathrooms" name="bathrooms" value={listing.bathrooms} onChange={handleChange} fullWidth required /></Grid>
      <Grid item xs={12} sm={4}><TextField label="Size (sqft)" name="size" value={listing.size} onChange={handleChange} fullWidth required /></Grid>
      <Grid item xs={12}>
        <InputLabel>Amenities</InputLabel>
        <Select
          multiple
          name="amenities"
          value={listing.amenities}
          onChange={handleAmenitiesChange}
          input={<OutlinedInput label="Amenities" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          fullWidth
        >
          {amenitiesList.map(a => <MenuItem key={a} value={a}><Checkbox checked={listing.amenities.indexOf(a) > -1} />{a}</MenuItem>)}
        </Select>
      </Grid>
    </Grid>
  );

  // Section 3: Media
  const renderMedia = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button variant="contained" component="label">
          Upload Photos
          <input type="file" hidden multiple accept="image/*" onChange={handlePhotoUpload} />
        </Button>
        <Box mt={2} display="flex" gap={2} flexWrap="wrap">
          {listing.photos.map((file, idx) => (
            <img key={idx} src={URL.createObjectURL(file)} alt="property" width={120} style={{ borderRadius: 8 }} />
          ))}
        </Box>
      </Grid>
    </Grid>
  );

  // Section 4: Listing Details
  const renderListingDetails = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}><TextField select label="Status" name="status" value={listing.status} onChange={handleChange} fullWidth>{statusList.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField label="Available Date" name="availableDate" type="date" value={listing.availableDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
      <Grid item xs={12}><TextField label="Contact Email" value={user?.email || ''} fullWidth disabled /></Grid>
    </Grid>
  );

  return (
    <Box maxWidth={800} mx="auto">
      <Typography variant="h5" mb={2}>Add New Property Listing</Typography>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        <form onSubmit={handleSubmit}>
          {step === 0 && renderPropertyDetails()}
          {step === 1 && renderFeatures()}
          {step === 2 && renderMedia()}
          {step === 3 && renderListingDetails()}
          <Box mt={3} display="flex" justifyContent="space-between">
            {step > 0 && <Button onClick={handleBack}>Back</Button>}
            {step < steps.length - 1 && <Button variant="contained" onClick={handleNext}>Next</Button>}
            {step === steps.length - 1 && <Button type="submit" variant="contained">Submit</Button>}
          </Box>
        </form>
        {submitted && (
          <Box mt={3}><Typography color="success.main">Property listed successfully!</Typography></Box>
        )}
      </Paper>
    </Box>
  );
} 
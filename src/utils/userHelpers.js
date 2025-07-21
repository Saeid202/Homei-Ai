import { supabase } from '../supabaseClient';

export const getUserData = async (userId, role) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .eq('user_role', role)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const updateUserData = async (userId, role, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .eq('user_role', role)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

export const createUserProfile = async (userId, email, role) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        email: email,
        user_role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}; 
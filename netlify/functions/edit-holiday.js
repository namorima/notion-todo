import { requireAuth, createResponse, handleCORS } from './utils/auth.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fgvzzeaygassjvicxgli.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  // Verify authentication
  const auth = requireAuth(event.headers);
  if (!auth.authenticated) {
    return createResponse(401, { error: auth.error });
  }

  try {
    const { id, date, name, state } = JSON.parse(event.body);

    // Validate inputs
    if (!id || !date || !name || !state) {
      return createResponse(400, { error: 'ID, date, name, and state are required' });
    }

    // Extract year from date
    const year = new Date(date).getFullYear();

    // Initialize Supabase client
    if (!SUPABASE_KEY) {
      console.error('SUPABASE_KEY not configured');
      return createResponse(500, { error: 'Database connection not configured' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Update holiday
    const { data, error } = await supabase
      .from('holidays')
      .update({
        date,
        name,
        state,
        year
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return createResponse(500, { error: 'Failed to update holiday' });
    }

    console.log(`✅ Updated holiday: ${name} (ID: ${id})`);

    return createResponse(200, {
      success: true,
      holiday: data
    });

  } catch (error) {
    console.error('Error updating holiday:', error);
    return createResponse(500, { error: 'Error updating holiday' });
  }
}

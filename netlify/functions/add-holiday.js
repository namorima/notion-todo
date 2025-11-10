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
    const { date, name, state, year } = JSON.parse(event.body);

    // Validate inputs
    if (!date || !name || !state) {
      return createResponse(400, { error: 'Date, name, and state are required' });
    }

    // Auto-extract year from date if not provided
    const holidayYear = year || new Date(date).getFullYear();

    // Initialize Supabase client
    if (!SUPABASE_KEY) {
      console.error('SUPABASE_KEY not configured');
      return createResponse(500, { error: 'Database connection not configured' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Insert holiday
    const { data, error } = await supabase
      .from('holidays')
      .insert([{
        date,
        name,
        state,
        year: holidayYear
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return createResponse(500, { error: 'Failed to add holiday' });
    }

    console.log(`✅ Added holiday: ${name} on ${date}`);

    return createResponse(200, {
      success: true,
      holiday: data
    });

  } catch (error) {
    console.error('Error adding holiday:', error);
    return createResponse(500, { error: 'Error adding holiday' });
  }
}

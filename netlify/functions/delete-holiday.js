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
    const { id } = JSON.parse(event.body);

    // Validate input
    if (!id) {
      return createResponse(400, { error: 'Holiday ID is required' });
    }

    // Initialize Supabase client
    if (!SUPABASE_KEY) {
      console.error('SUPABASE_KEY not configured');
      return createResponse(500, { error: 'Database connection not configured' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Delete holiday
    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return createResponse(500, { error: 'Failed to delete holiday' });
    }

    console.log(`✅ Deleted holiday ID: ${id}`);

    return createResponse(200, {
      success: true,
      message: 'Holiday deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting holiday:', error);
    return createResponse(500, { error: 'Error deleting holiday' });
  }
}

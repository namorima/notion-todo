import { verifyPassword, createToken, createResponse, handleCORS } from './utils/auth.js';

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    const { password } = JSON.parse(event.body);

    if (!password) {
      return createResponse(400, { error: 'Password is required' });
    }

    // Verify password
    if (!verifyPassword(password)) {
      return createResponse(401, {
        error: 'Password salah! Sila cuba lagi.',
        success: false
      });
    }

    // Create token
    const token = createToken({
      authenticated: true,
      timestamp: Date.now()
    });

    return createResponse(200, {
      success: true,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, {
      error: 'Internal server error',
      success: false
    });
  }
}

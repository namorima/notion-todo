// JWT Authentication Utility for Netlify Functions
// Using simple base64 encoding for tokens (for basic auth)
// For production, use jsonwebtoken library

const APP_PASSWORD = process.env.APP_PASSWORD || 'akmal';
const JWT_SECRET = process.env.JWT_SECRET || 'notion-manager-secret-key-2025';

/**
 * Create a simple JWT-like token
 * @param {Object} payload - Data to encode in token
 * @returns {string} - Encoded token
 */
export function createToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60 * 1000) // 24 hours
  };

  // Simple encoding (in production, use proper JWT library)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
  const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`).toString('base64');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode token
 * @param {string} token - Token to verify
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = Buffer.from(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`).toString('base64');
    if (signature !== expectedSignature) return null;

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());

    // Check expiration
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Verify password
 * @param {string} password - Password to verify
 * @returns {boolean} - True if password is correct
 */
export function verifyPassword(password) {
  return password === APP_PASSWORD;
}

/**
 * Extract token from Authorization header
 * @param {Object} headers - Request headers
 * @returns {string|null} - Token or null
 */
export function extractToken(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Middleware to verify authentication
 * @param {Object} headers - Request headers
 * @returns {Object} - { authenticated: boolean, user: Object|null, error: string|null }
 */
export function requireAuth(headers) {
  const token = extractToken(headers);

  if (!token) {
    return {
      authenticated: false,
      user: null,
      error: 'No authentication token provided'
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      authenticated: false,
      user: null,
      error: 'Invalid or expired token'
    };
  }

  return {
    authenticated: true,
    user: payload,
    error: null
  };
}

/**
 * Create standardized response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} - Netlify function response
 */
export function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Handle CORS preflight
 * @returns {Object} - CORS response
 */
export function handleCORS() {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: ''
  };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const rateLimit = new Map<string, number[]>();
const MAX_REQUESTS = 100;
const TIME_WINDOW = 60 * 1000; // 1 minute

export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  
  // Remove old requests
  const recentRequests = requests.filter(time => now - time < TIME_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
};

export const sanitizeHeaders = (headers: Headers): Headers => {
  const sanitized = new Headers(headers);
  // Remove potentially sensitive headers
  sanitized.delete('cookie');
  sanitized.delete('authorization');
  return sanitized;
};

export const validateAuthToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const securityMiddleware = async (req: Request): Promise<Response | null> => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';

  // Check rate limit
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { 
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Validate auth token if present
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];
    if (!await validateAuthToken(token)) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return null; // Continue to main handler
};
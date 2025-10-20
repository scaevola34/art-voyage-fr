import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';
import { checkRateLimit, getClientIdentifier, createRateLimitResponse } from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestionRequest {
  suggestionType: 'place' | 'event';
  name: string;
  type?: string;
  eventType?: string;
  city?: string;
  region?: string;
  address?: string;
  description?: string;
  website?: string;
  email?: string;
  instagram?: string;
  openingHours?: string;
  startDate?: string;
  endDate?: string;
  submitterName?: string;
  submitterEmail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client identifier for rate limiting
    const clientId = getClientIdentifier(req);
    console.log('Processing suggestion from:', clientId);

    // Apply rate limiting: 3 requests per minute, 5 minute block
    const rateLimitResult = await checkRateLimit(clientId, 'submit-suggestion', {
      maxAttempts: 3,
      windowMs: 60000, // 1 minute
      blockDurationMs: 300000, // 5 minutes
    });

    if (!rateLimitResult.allowed) {
      console.log('Rate limit exceeded for:', clientId);
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Parse and validate request body
    const suggestionData: SuggestionRequest = await req.json();

    // Validate required fields
    if (!suggestionData.name || !suggestionData.suggestionType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name and suggestionType' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Additional validation based on suggestion type
    if (suggestionData.suggestionType === 'place' && !suggestionData.type) {
      return new Response(
        JSON.stringify({ error: 'Missing required field for place: type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (suggestionData.suggestionType === 'event') {
      if (!suggestionData.eventType || !suggestionData.startDate || !suggestionData.endDate) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for event: eventType, startDate, endDate' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Store suggestion in database (you could create a suggestions table)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the suggestion (you could enhance this by storing in a dedicated table)
    console.log('Suggestion received:', {
      type: suggestionData.suggestionType,
      name: suggestionData.name,
      city: suggestionData.city,
      submittedBy: suggestionData.submitterEmail,
      timestamp: new Date().toISOString(),
    });

    // Return success response with rate limit headers
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Suggestion submitted successfully',
        remainingAttempts: rateLimitResult.remainingAttempts,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimitResult.remainingAttempts),
        },
      }
    );
  } catch (error) {
    console.error('Error processing suggestion:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

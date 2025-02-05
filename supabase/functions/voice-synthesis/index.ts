import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();

    if (!text || !voiceId) {
      throw new Error('Text and voiceId are required');
    }

    // Get ElevenLabs API key from secrets
    const { data: secretData, error: secretError } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'ELEVEN_LABS_API_KEY')
      .maybeSingle();

    if (secretError || !secretData) {
      throw new Error('Failed to retrieve ElevenLabs API key');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': secretData.secret,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs API error:', errorData);
      throw new Error('Failed to synthesize speech');
    }

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer();
    
    // Convert to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioData))
    );

    return new Response(
      JSON.stringify({ audio: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Voice synthesis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
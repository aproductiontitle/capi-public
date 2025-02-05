import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, assistantId } = await req.json();

    // Get assistant details from database
    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', assistantId)
      .single();

    if (assistantError) throw assistantError;

    // Get OpenAI API key from secrets
    const { data: secretData, error: secretError } = await supabase
      .from('secrets')
      .select('secret')
      .eq('name', 'OPENAI_API_KEY')
      .eq('user_id', assistant.user_id)
      .single();

    if (secretError || !secretData) {
      throw new Error('OpenAI API key not found');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretData.secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are ${assistant.name}. ${assistant.greeting_message}`,
          },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in assistant-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
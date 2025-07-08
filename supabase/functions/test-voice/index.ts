
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_DEFAULT_VOICE_ID = 'fable';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { voiceId, text } = await req.json();
    const sampleText = text || "Hello, this is a test of my voice. I hope you like it!";

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set in Supabase secrets.');
      throw new Error('OpenAI API key is not configured. Please check your Supabase Edge Function secrets.');
    }

    console.log('Testing voice generation with OpenAI API...');
    console.log('Voice:', voiceId || OPENAI_DEFAULT_VOICE_ID);
    console.log('Text length:', sampleText.length);
    
    const selectedVoice = voiceId || OPENAI_DEFAULT_VOICE_ID;

    // Add retry logic for rate limiting
    let retryCount = 0;
    const maxRetries = 3;
    let response;

    while (retryCount < maxRetries) {
      try {
        response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: sampleText,
            voice: selectedVoice,
            response_format: 'mp3',
          }),
        });

        console.log(`OpenAI TTS API response status: ${response.status} (attempt ${retryCount + 1})`);

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : (retryCount + 1) * 2000;
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`OpenAI TTS API error: ${response.status} - ${errorBody}`);
          
          if (response.status === 401) {
            throw new Error('OpenAI API key is invalid. Please verify your API key in Supabase Edge Function secrets.');
          } else if (response.status === 429) {
            throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again.');
          } else {
            throw new Error(`OpenAI TTS API error: ${response.status} - ${errorBody}`);
          }
        }

        // Success - break out of retry loop
        break;

      } catch (error) {
        if (retryCount === maxRetries - 1) {
          throw error;
        }
        console.log(`Attempt ${retryCount + 1} failed, retrying...`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Convert arrayBuffer to base64
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Voice generation successful');
    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating test audio:', error);
    
    // Return more helpful error messages
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage = 'OpenAI API rate limit exceeded. Please wait a moment and try again, or check your OpenAI account at https://platform.openai.com/usage';
      statusCode = 429;
    } else if (error.message?.includes('Invalid API key') || error.message?.includes('401')) {
      errorMessage = 'OpenAI API key is invalid. Please verify your API key in Supabase Edge Function secrets.';
      statusCode = 401;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'If this issue persists, check your OpenAI account status and API key configuration.'
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

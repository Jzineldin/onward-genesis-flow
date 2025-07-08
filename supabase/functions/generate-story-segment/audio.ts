
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function generateAudio(text: string, voice: string = 'fable'): Promise<{ audioUrl: string; duration: number } | null> {
  console.log("Generating audio with OpenAI TTS for voice:", voice);
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  console.log("OpenAI API Key status:", openAIApiKey ? 'Found' : 'Missing');

  if (!openAIApiKey) {
    console.error("OPENAI_API_KEY environment variable is not set in Supabase Edge Function secrets");
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    console.log(`OpenAI TTS API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenAI TTS API error: ${response.status} ${errorBody}`);
      
      // More specific error logging
      if (response.status === 401) {
        console.error("OpenAI API key is invalid or expired. Please check your API key in Supabase Edge Function secrets.");
      } else if (response.status === 429) {
        console.error("OpenAI API rate limit exceeded. Your quota may be exhausted.");
      } else {
        console.error(`OpenAI TTS API error: ${response.status} - ${errorBody}`);
      }
      
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error("OpenAI returned an empty audio buffer.");
      return null;
    }

    console.log(`Successfully generated audio from OpenAI TTS. Size: ${audioBuffer.byteLength} bytes`);
    
    // For now, we'll just return a placeholder since we don't have storage setup for audio segments
    // In a full implementation, you'd upload to Supabase storage here
    return {
      audioUrl: "placeholder_audio_url",
      duration: Math.ceil(text.length / 20) // Rough estimate: ~20 characters per second
    };

  } catch (error) {
    console.error("Error calling OpenAI TTS API:", error.message);
    return null;
  }
}

// Upload audio to Supabase storage
export async function uploadAudioToStorage(audioBuffer: ArrayBuffer, client: SupabaseClient): Promise<string | null> {
  try {
    const filePath = `audio_${Date.now()}.mp3`;
    console.log(`Uploading audio to storage at path: ${filePath}`);

    const { data, error } = await client.storage
      .from('story-audio')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
      });

    if (error) {
      console.error(`Failed to upload audio to storage: ${error.message}`);
      return null;
    }
    
    const { data: { publicUrl } } = client.storage.from('story-audio').getPublicUrl(data.path);
    console.log(`Audio uploaded successfully. Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (uploadError) {
    console.error("Audio upload error:", uploadError);
    return null;
  }
}

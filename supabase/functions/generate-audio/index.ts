
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'fable', speed = 1.0, segmentId } = await req.json()

    console.log('🔊 Generating audio:', { 
      textLength: text?.length, 
      voice, 
      speed, 
      segmentId 
    })

    if (!text) {
      throw new Error('Text is required for audio generation')
    }

    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate audio using OpenAI TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Higher quality model
        input: text.substring(0, 4096), // OpenAI limit
        voice: voice,
        speed: speed,
        response_format: 'mp3'
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI TTS error:', response.status, errorText)
      throw new Error(`OpenAI TTS error: ${response.status}`)
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `story_audio_${segmentId || Date.now()}.mp3`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-audio')
      .getPublicUrl(fileName)

    // Estimate duration (rough calculation: ~150 words per minute)
    const wordCount = text.split(/\s+/).length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60) // seconds

    console.log('✅ Audio generated successfully:', {
      publicUrl,
      duration: estimatedDuration,
      fileName
    })

    return new Response(
      JSON.stringify({ 
        audio_url: publicUrl,
        duration: estimatedDuration,
        success: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Audio generation failed:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

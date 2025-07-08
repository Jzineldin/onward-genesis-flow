
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGenerationSettings } from './settings.ts'
import { processImageGeneration } from './image-background-tasks.ts'
import { generateAudio } from './audio.ts'
import { validateRequest } from './request-validation.ts'
import { createStoryIfNeeded, fetchPreviousSegments } from './story-creation.ts'
import { generateStoryContent } from './text-generation.ts'
import { saveStorySegment } from './segment-storage.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== STORY GENERATION START ===');
    
    const requestBody = await req.json();
    const { prompt, genre, storyId, parentSegmentId, choiceText, skipImage, skipAudio, storyMode } = validateRequest(requestBody);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Load admin settings for image generation configuration
    console.log('⚙️ Loading admin settings for image generation...');
    const settings = await getGenerationSettings(supabaseAdmin);
    console.log('⚙️ Image provider settings:', settings.imageProviders);

    // Create story or get existing story ID
    const finalStoryId = await createStoryIfNeeded(supabaseClient, storyId, prompt, genre, storyMode);

    // Fetch previous segments for context
    const previousSegments = await fetchPreviousSegments(supabaseClient, finalStoryId);

    // Generate story text
    console.log('📝 Starting text generation...')
    const storyResult = await generateStoryContent(prompt, choiceText, genre || storyMode || 'fantasy')
    console.log('✅ Text generation completed')

    // Handle audio generation
    let audioUrl = null
    let audioStatus = 'not_started'
    
    if (!skipAudio) {
      try {
        console.log('🔊 Starting audio generation...')
        audioUrl = await generateAudio(storyResult.segmentText)
        audioStatus = audioUrl ? 'completed' : 'failed';
      } catch (audioError) {
        console.error('❌ Audio generation failed:', audioError)
        audioStatus = 'failed';
      }
    }

    // Save segment to database
    const segment = await saveStorySegment(
      supabaseClient,
      finalStoryId,
      parentSegmentId,
      storyResult,
      choiceText,
      audioUrl,
      audioStatus,
      skipImage
    );

    // Start image generation as background task if not skipped
    if (!skipImage && storyResult.imagePrompt) {
      console.log('🎨 Starting background image generation task...');
      
      const visualContext = {
        genre: genre || storyMode || 'fantasy',
        characters: [],
        setting: '',
        previousSegments: previousSegments.map(s => s.segment_text).join(' ').substring(0, 500)
      };

      EdgeRuntime.waitUntil(
        processImageGeneration(
          segment.id,
          finalStoryId,
          storyResult.imagePrompt,
          supabaseAdmin,
          supabaseClient,
          visualContext
        )
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: segment }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('💥 Error in story generation:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Story generation failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

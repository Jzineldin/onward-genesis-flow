import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateStoryContent } from '../generate-story-segment/llm.ts'
import { processImageGeneration } from '../generate-story-segment/image-background-tasks.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== FINISH STORY FUNCTION START ===');
    
    const { storyId, skipImage = false } = await req.json()
    console.log('🏁 Finishing story with ID:', storyId);
    console.log('📸 Skip image for ending:', skipImage);

    if (!storyId) {
      throw new Error('Story ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the story details and all segments for context
    const { data: story, error: storyError } = await supabaseClient
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError) {
      console.error('Error fetching story:', storyError);
      throw new Error(`Failed to fetch story: ${storyError.message}`);
    }

    // Get all story segments for context
    const { data: segments, error: segmentsError } = await supabaseClient
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (segmentsError || !segments || segments.length === 0) {
      console.error('Error fetching segments:', segmentsError);
      throw new Error('Failed to fetch story segments');
    }

    const latestSegment = segments[segments.length - 1];
    console.log('📖 Latest segment found:', latestSegment.id);

    // Create story context for ending generation
    const storyText = segments.map(seg => seg.segment_text).join('\n\n');
    
    const endingPrompt = `Write a satisfying conclusion to this ${story.story_mode || 'fantasy'} story. 

Complete story so far:
${storyText}

Create a proper ending that:
- Brings the story to a meaningful close
- Resolves the main conflict or journey
- Provides closure for the characters
- Matches the tone and style of the story
- Is 100-150 words
- Does NOT include any choices (this is the ending)

Write only the conclusion segment text.`;

    console.log('🎯 Generating story ending using configured text provider (Qwen)...');

    // Use the same text generation pipeline as main story generation
    // This will respect admin settings (Qwen as primary, OpenAI as fallback)
    const visualContext = {
      genre: story.story_mode || 'fantasy',
      characters: [],
      setting: '',
      previousSegments: segments.map(s => s.segment_text).join(' ').substring(0, 500)
    };
    
    const narrativeContext = {
      summary: 'Story conclusion',
      currentObjective: 'Conclude the adventure with a satisfying ending',
      arcStage: 'resolution'
    };

    const storyResult = await generateStoryContent(
      endingPrompt, 
      'End the story', 
      visualContext, 
      narrativeContext, 
      story.story_mode || 'fantasy',
      supabaseAdmin
    );

    if (!storyResult.segmentText) {
      throw new Error('Failed to generate ending text');
    }

    console.log('✅ Story ending text generated using configured providers');

    // Create the ending segment directly in the database
    const { data: endingSegment, error: insertError } = await supabaseClient
      .from('story_segments')
      .insert({
        story_id: storyId,
        parent_segment_id: latestSegment.id,
        segment_text: storyResult.segmentText,
        choices: [], // No choices for ending
        is_end: true, // Mark as ending
        triggering_choice_text: 'End the story',
        word_count: storyResult.segmentText.split(/\s+/).filter(word => word.length > 0).length,
        image_generation_status: skipImage ? 'not_started' : 'pending',
        audio_generation_status: 'not_started'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating ending segment:', insertError);
      throw new Error(`Failed to create ending segment: ${insertError.message}`);
    }

    console.log('✅ Ending segment created:', endingSegment.id);

    // Start image generation as background task if not skipped
    // This will use the configured image provider (OVH Stable Diffusion)
    if (!skipImage && storyResult.imagePrompt) {
      console.log('🎨 Starting background image generation for ending using configured provider (OVH Stable Diffusion)...');
      
      EdgeRuntime.waitUntil(
        processImageGeneration(
          endingSegment.id,
          storyId,
          storyResult.imagePrompt,
          supabaseAdmin,
          supabaseClient,
          visualContext
        )
      );
    }

    // Mark the story as completed
    const { error: storyUpdateError } = await supabaseClient
      .from('stories')
      .update({ is_completed: true })
      .eq('id', storyId);

    if (storyUpdateError) {
      console.warn('Warning: Could not mark story as completed:', storyUpdateError);
    }

    console.log('✅ Story finished successfully with generated ending using configured providers');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Story finished successfully with generated ending',
        endingSegment: { ...endingSegment, is_end: true, choices: [] }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('💥 Error finishing story:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to finish story'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

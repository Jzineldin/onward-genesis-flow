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
    console.log('=== FINISH STORY FUNCTION START ===');
    
    const { storyId, skipImage = true } = await req.json()
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
    
    // Generate a proper ending using the story generation function
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

    console.log('🎯 Generating story ending...');

    // Call the story generation function to create the ending
    const { data: endingResult, error: generationError } = await supabaseClient.functions.invoke('generate-story-segment', {
      body: {
        storyId: storyId,
        prompt: endingPrompt,
        parentSegmentId: latestSegment.id,
        choiceText: 'End the story',
        storyMode: story.story_mode || 'fantasy',
        skipImage: skipImage,
        skipAudio: true
      }
    });

    if (generationError) {
      console.error('Error generating ending:', generationError);
      throw new Error(`Failed to generate ending: ${generationError.message}`);
    }

    if (!endingResult || !endingResult.data) {
      throw new Error('Invalid response from story generation');
    }

    const endingSegment = endingResult.data;
    console.log('✅ Ending segment generated:', endingSegment.id);

    // Mark the ending segment as the end and remove any choices
    const { error: updateError } = await supabaseClient
      .from('story_segments')
      .update({ 
        is_end: true,
        choices: [] // Ensure no choices for the ending
      })
      .eq('id', endingSegment.id);

    if (updateError) {
      console.error('Error updating ending segment:', updateError);
      throw new Error(`Failed to mark ending segment: ${updateError.message}`);
    }

    // Mark the story as completed
    const { error: storyUpdateError } = await supabaseClient
      .from('stories')
      .update({ is_completed: true })
      .eq('id', storyId);

    if (storyUpdateError) {
      console.warn('Warning: Could not mark story as completed:', storyUpdateError);
    }

    console.log('✅ Story finished successfully with generated ending');

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

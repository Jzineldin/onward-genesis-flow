
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

    console.log('🎯 Generating story ending with OpenAI...');

    // Generate ending text using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a master storyteller AI. Write a compelling story ending that concludes the narrative. Return only the ending text, no JSON, no choices, just the story conclusion.` 
          },
          { role: 'user', content: endingPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const endingText = data.choices?.[0]?.message?.content;
    
    if (!endingText) {
      throw new Error('Failed to generate ending text');
    }

    console.log('✅ Story ending text generated');

    // Create the ending segment directly in the database
    const { data: endingSegment, error: insertError } = await supabaseClient
      .from('story_segments')
      .insert({
        story_id: storyId,
        parent_segment_id: latestSegment.id,
        segment_text: endingText,
        choices: [], // No choices for ending
        is_end: true, // Mark as ending
        triggering_choice_text: 'End the story',
        word_count: endingText.split(/\s+/).filter(word => word.length > 0).length,
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
    if (!skipImage) {
      console.log('🎨 Starting background image generation for ending...');
      
      // Generate image prompt for the ending
      try {
        const imagePromptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: `Create a detailed image prompt for the final scene of this story. Focus on the climactic or concluding visual moment.` 
              },
              { role: 'user', content: `Story ending: ${endingText}\n\nCreate an image prompt for the final scene.` }
            ],
            temperature: 0.7,
            max_tokens: 200
          }),
        });

        if (imagePromptResponse.ok) {
          const imageData = await imagePromptResponse.json();
          const imagePrompt = imageData.choices?.[0]?.message?.content;
          
          if (imagePrompt) {
            // Start background image generation
            if (typeof EdgeRuntime !== 'undefined') {
              EdgeRuntime.waitUntil(
                supabaseClient.functions.invoke('generate-story-segment', {
                  body: {
                    action: 'generate_image_only',
                    segmentId: endingSegment.id,
                    storyId: storyId,
                    segmentText: endingText,
                    imagePrompt: imagePrompt
                  }
                })
              );
            }
          }
        }
      } catch (imageError) {
        console.warn('Image prompt generation failed, continuing without image:', imageError);
      }
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

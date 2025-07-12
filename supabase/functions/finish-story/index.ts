
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Self-contained story generation function for endings
async function generateStoryEnding(prompt: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🎯 Generating story ending with OpenAI GPT-4o-mini...');

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
          content: 'You are a master storyteller. Generate compelling story content with proper conclusions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const segmentText = data.choices[0].message.content;

  return {
    segmentText,
    imagePrompt: `Epic conclusion scene, cinematic lighting, fantasy illustration style`
  };
}

// Self-contained image generation function
async function processImageGeneration(
  segmentId: string,
  storyId: string,
  imagePrompt: string,
  supabaseAdmin: any,
  supabaseClient: any
) {
  console.log(`🎨 Starting image background task for segment ${segmentId}`);
  
  try {
    // Update status to in_progress
    await supabaseAdmin
      .from('story_segments')
      .update({ image_generation_status: 'in_progress' })
      .eq('id', segmentId);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate image with OpenAI DALL-E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Image API error: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;
    
    // Convert base64 to blob
    const imageBlob = new Uint8Array(atob(base64Image).split('').map(char => char.charCodeAt(0)));
    
    // Upload to Supabase Storage
    const fileName = `story-${storyId}-segment-${segmentId}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('story-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('story-images')
      .getPublicUrl(fileName);

    // Update segment with image URL
    await supabaseAdmin
      .from('story_segments')
      .update({ 
        image_url: publicUrl,
        image_generation_status: 'completed'
      })
      .eq('id', segmentId);

    console.log(`✅ Image generated successfully for segment ${segmentId}`);
    
  } catch (error) {
    console.error(`❌ Image generation failed for segment ${segmentId}:`, error);
    
    await supabaseAdmin
      .from('story_segments')
      .update({ image_generation_status: 'failed' })
      .eq('id', segmentId);
  }
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

    console.log('🎯 Generating story ending...');

    const storyResult = await generateStoryEnding(endingPrompt);

    if (!storyResult.segmentText) {
      throw new Error('Failed to generate ending text');
    }

    console.log('✅ Story ending text generated');

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
    if (!skipImage && storyResult.imagePrompt) {
      console.log('🎨 Starting background image generation for ending...');
      
      EdgeRuntime.waitUntil(
        processImageGeneration(
          endingSegment.id,
          storyId,
          storyResult.imagePrompt,
          supabaseAdmin,
          supabaseClient
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

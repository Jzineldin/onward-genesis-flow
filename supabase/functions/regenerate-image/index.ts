
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateImageWithFallback, uploadImageToStorageWithBucket } from '../_shared/image-generator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== IMAGE REGENERATION START ===');
    
    const { segmentId } = await req.json();
    
    if (!segmentId) {
      return new Response(
        JSON.stringify({ error: 'Missing segmentId parameter' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
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

    // Get the segment details
    const { data: segment, error: segmentError } = await supabaseClient
      .from('story_segments')
      .select('*')
      .eq('id', segmentId)
      .single()

    if (segmentError || !segment) {
      console.error('Failed to fetch segment:', segmentError)
      return new Response(
        JSON.stringify({ error: 'Segment not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Update status to in_progress
    await supabaseAdmin
      .from('story_segments')
      .update({ 
        image_generation_status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', segmentId)

    console.log('🎨 Starting image regeneration for segment:', segmentId)

    // Create a simple image prompt from the segment text
    const imagePrompt = `Create a high-quality illustration for this story scene: ${segment.segment_text.substring(0, 500)}...`
    
    console.log('Generated image prompt:', imagePrompt)

    // Generate the image
    const imageBlob = await generateImageWithFallback(imagePrompt)
    
    if (!imageBlob) {
      console.error('❌ Image generation failed - no image blob returned')
      
      // Update status to failed
      await supabaseAdmin
        .from('story_segments')
        .update({ 
          image_generation_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', segmentId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Image generation service is currently unavailable' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503
        }
      )
    }

    // Upload the image
    console.log('📤 Uploading generated image...')
    const imageUrl = await uploadImageToStorageWithBucket(imageBlob, supabaseAdmin)
    
    // Update the segment with the new image
    const { error: updateError } = await supabaseAdmin
      .from('story_segments')
      .update({
        image_url: imageUrl,
        image_generation_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', segmentId)

    if (updateError) {
      console.error('❌ Failed to update segment with new image:', updateError)
      throw updateError
    }

    console.log('✅ Image regeneration completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        message: 'Image regenerated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💥 Error in image regeneration:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Image regeneration failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

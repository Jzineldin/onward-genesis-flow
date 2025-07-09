import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateImage } from "../generate-story-segment/image.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, testMode = false } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🖼️ Regenerating image with prompt: "${prompt}"`)
    console.log(`🧪 Test mode: ${testMode}`)

    // Generate image using dynamic provider system
    const imageBlob = await generateImage(prompt, supabaseClient, testMode)

    if (!imageBlob) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate image with all available providers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (testMode) {
      // In test mode, just return success without storing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Image generation test completed successfully',
          imageSize: imageBlob.size 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For non-test mode, you would upload to storage here
    // But for now just return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Image regenerated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in regenerate-image function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
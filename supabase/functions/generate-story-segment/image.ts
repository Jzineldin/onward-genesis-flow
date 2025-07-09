
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGenerationSettings } from "./settings.ts";
import { createEnhancedImagePrompt } from "./enhanced-image-prompting.ts";

// Import all available image generation services
import { generateImageWithOpenAI } from "./openai-image-service.ts";
import { generateImageWithOVH } from "./ovh-image-service.ts";

/**
 * Main function for generating images.
 * It reads the settings from the database to decide which provider to use.
 */
export async function generateImage(prompt: string, client: SupabaseClient, testMode: boolean = false): Promise<Blob | null> {
  console.log('🎨 Starting dynamic image generation...');
  console.log(`🧪 Test mode: ${testMode}`);
  
  const settings = await getGenerationSettings(client);
  const primaryProvider = settings.imageProviders.primary;
  const fallbackProvider = settings.imageProviders.fallback;

  const visualContext = {
    style: "epic fantasy illustration, digital art, cinematic lighting, high detail",
    characters: [] // This will be loaded from story data in the future
  };

  const enhancedPrompt = createEnhancedImagePrompt(prompt, visualContext);

  console.log(`Primary provider set to: ${primaryProvider}`);
  
  // --- Try Primary Provider ---
  let imageBlob = await callImageProvider(primaryProvider, enhancedPrompt, settings);

  if (imageBlob) {
    console.log(`✅ Successfully generated image with primary provider: ${primaryProvider}`);
    return imageBlob;
  }

  // --- If Primary Fails, Try Fallback Provider ---
  console.warn(`Primary provider '${primaryProvider}' failed. Trying fallback: ${fallbackProvider}`);
  imageBlob = await callImageProvider(fallbackProvider, enhancedPrompt, settings);
  
  if (imageBlob) {
    console.log(`✅ Successfully generated image with fallback provider: ${fallbackProvider}`);
    return imageBlob;
  }

  console.error('❌ All image generation providers failed.');
  return null;
}

/**
 * Helper function to call the correct service based on the provider name.
 */
async function callImageProvider(provider: string, prompt: string, settings: any): Promise<Blob | null> {
    switch (provider) {
        case 'ovh':
            return await generateImageWithOVH(prompt, settings.imageProviders?.ovhSettings);
        case 'openai':
            return await generateImageWithOpenAI(prompt, null);
        // Add other providers like 'replicate' here in the future
        default:
            console.error(`Unknown image provider setting: '${provider}'. Defaulting to OpenAI.`);
            return await generateImageWithOpenAI(prompt, null);
    }
}

// Legacy function for backward compatibility
export async function generateImageWithFallback(prompt: string, visualContext?: any): Promise<Blob | null> {
  // For now, default to OpenAI until all calling code is updated
  return await generateImageWithOpenAI(prompt, visualContext);
}

export async function uploadImageToStorage(imageBlob: Blob, client: SupabaseClient): Promise<string> {
  const filePath = `story_image_${Date.now()}.png`;
  console.log(`📤 Uploading image to storage: ${filePath}`);

  try {
    const { data, error } = await client.storage
      .from('story_images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
      });

    if (error) {
      console.error('❌ Storage upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    const { data: { publicUrl } } = client.storage
      .from('story_images')
      .getPublicUrl(data.path);
    
    console.log(`✅ Image uploaded successfully: ${publicUrl}`);
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Image upload error:', error);
    throw error;
  }
}


import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateImageWithFallback as sharedGenerateImageWithFallback, uploadImageToStorageWithBucket } from "../_shared/image-generator.ts";

// Main function for generating images with DALL-E-3
export async function generateImageWithFallback(prompt: string, visualContext?: any): Promise<Blob | null> {
  return await sharedGenerateImageWithFallback(prompt, visualContext);
}

export async function uploadImageToStorage(imageBlob: Blob, client: SupabaseClient): Promise<string> {
  return await uploadImageToStorageWithBucket(imageBlob, client);
}

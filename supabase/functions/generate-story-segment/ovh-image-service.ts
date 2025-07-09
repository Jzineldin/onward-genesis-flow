export async function generateImageWithOVH(prompt: string, settings?: any): Promise<Blob | null> {
    const OVH_API_TOKEN = Deno.env.get('OVH_API_TOKEN');
    if (!OVH_API_TOKEN) {
        console.error('OVH_API_TOKEN is not set.');
        return null;
    }

    const IMAGE_GENERATION_URL = 'https://stable-diffusion-xl.endpoints.kepler.ai.cloud.ovh.net/api/text2image';

    console.log('🎨 Calling OVHcloud for image generation...');
    
    // Use settings if provided, otherwise use defaults
    const negativePrompt = settings?.negative_prompt || 'Ugly, blurry, low quality';
    const steps = settings?.steps || 20;
    
    try {
        const response = await fetch(IMAGE_GENERATION_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/octet-stream', 
                'Authorization': `Bearer ${OVH_API_TOKEN}` 
            },
            body: JSON.stringify({ 
                prompt: prompt, 
                negative_prompt: negativePrompt,
                num_inference_steps: steps
            }),
        });

        if (!response.ok) {
            console.error(`OVH Image Gen Error: ${await response.text()}`);
            return null;
        }
        
        console.log('✅ Successfully generated image with OVHcloud.');
        return await response.blob();
    } catch (error) {
        console.error('Error during OVH image generation:', error);
        return null;
    }
}
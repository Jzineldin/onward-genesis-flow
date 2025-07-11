
import { generateStoryWithQwen } from './ovh-text-service.ts';
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Generates story content using OVH Qwen2.5 (primary) or OpenAI GPT-4o-mini (fallback).
 * 
 * This function is the core of TaleForge's AI-powered story generation system.
 * It maintains narrative consistency by incorporating:
 * - Previous story segments for context continuity
 * - Visual context (characters, settings, art style) for consistent image generation
 * - Narrative context (story summary, objectives) for coherent plot development
 * - User choices to drive branching narrative paths
 * - Educational elements and age-appropriate content (enhanced with Qwen2.5)
 * 
 * The function returns structured JSON with story text, choice options, and image prompts
 * that enable TaleForge's multi-modal storytelling experience.
 * 
 * @param initialPrompt - Starting prompt for new story (genre/theme selection)
 * @param choiceText - User's selected choice text for story continuation
 * @param visualContext - Character descriptions, settings, and art style for image consistency
 * @param narrativeContext - Story summary and current objectives for plot coherence
 * @param storyMode - Story genre/mode (Epic Fantasy, Sci-Fi Thriller, etc.)
 * @param supabaseClient - Supabase client for loading provider settings
 * 
 * @returns Promise<object> Structured response with:
 *   - segmentText: Generated story text for current segment
 *   - choices: Array of 2-4 choice options for branching narrative
 *   - isEnd: Boolean indicating if story has reached a conclusion
 *   - imagePrompt: Detailed prompt for AI image generation
 *   - educationalElements: Array of learning objectives (Qwen2.5 feature)
 *   - ageAppropriateness: Target age group classification
 * 
 * @throws Error if both OVH and OpenAI fail or no API keys available
 */
async function generateStoryContent(
  initialPrompt?: string,
  choiceText?: string,
  visualContext?: any,
  narrativeContext?: any,
  storyMode?: string,
  supabaseClient?: SupabaseClient
) {
  console.log('🔧 Loading text provider settings...');
  
  // Try OVH Qwen2.5 first (primary provider for cost savings and educational features)
  try {
    console.log('🚀 Attempting OVH Qwen2.5 text generation...');
    const result = await generateStoryWithQwen(
      initialPrompt,
      choiceText,
      visualContext,
      narrativeContext,
      storyMode,
      supabaseClient
    );
    
    console.log('✅ OVH Qwen2.5 generation successful');
    return result;
    
  } catch (ovhError) {
    console.error('❌ OVH Qwen2.5 failed:', ovhError);
    console.log('🔄 Falling back to OpenAI GPT-4o-mini...');
    
    // Fallback to OpenAI
    return await generateStoryWithOpenAI(
      initialPrompt,
      choiceText,
      visualContext,
      narrativeContext,
      storyMode
    );
  }
}

/**
 * Generate story content using OpenAI GPT-4o-mini (fallback provider)
 */
async function generateStoryWithOpenAI(
  initialPrompt?: string,
  choiceText?: string,
  visualContext?: any,
  narrativeContext?: any,
  storyMode?: string
) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not available - both OVH and OpenAI failed');
  }

  console.log('🤖 Generating story with OpenAI GPT-4o-mini (fallback)...');

  // Add visual context for consistency
  let visualContextPrompt = '';
  if (visualContext) {
    const characters = Object.entries(visualContext.characters || {})
      .map(([name, desc]) => `${name}: ${desc}`)
      .join(', ');
    
    visualContextPrompt = characters ? `\n\nCHARACTERS TO MAINTAIN: ${characters}` : '';
    
    if (visualContext.setting) {
      visualContextPrompt += `\nSETTING: ${visualContext.setting}`;
    }
    
    if (visualContext.genre) {
      visualContextPrompt += `\nGENRE: ${visualContext.genre}`;
    }
  }

  // Add narrative context
  let narrativeContextPrompt = '';
  if (narrativeContext) {
    narrativeContextPrompt = `\n\nNARRATIVE CONTEXT:
- Story Summary: ${narrativeContext.summary || 'Adventure in progress'}
- Current Objective: ${narrativeContext.currentObjective || 'Continue the adventure'}
- Story Arc Stage: ${narrativeContext.arcStage || 'development'}`;
  }

  const systemPrompt = `You are a master storyteller AI. Generate immersive story segments in JSON format.

REQUIREMENTS:
- Generate 120-200 words for rich, detailed storytelling
- Create exactly 3 meaningful choices that advance the plot
- Include detailed image descriptions for visual consistency
- DO NOT include choice prompts, transitions, or references to choices within the segmentText
- The segmentText should end naturally as part of the story narrative
- Choices will be presented separately as interactive buttons
- MAINTAIN CONSISTENCY with previous story segments and established characters
- CONTINUE the narrative flow naturally from the previous context

Response format (EXACT JSON):
{
  "segmentText": "A 120-200 word story segment with vivid descriptions that ends naturally without any choice prompts",
  "choices": ["Choice 1", "Choice 2", "Choice 3"],
  "isEnd": false,
  "imagePrompt": "Detailed scene description for image generation consistent with established visual style",
  "visualContext": {"style": "established art style", "characters": {"name": "description"}, "setting": "current location"},
  "narrativeContext": {"summary": "updated story summary", "currentObjective": "next goal", "arcStage": "current stage"}
}`;

  // Build context from narrative context
  let contextPrompt = '';
  if (narrativeContext?.previousSegments) {
    contextPrompt = '\n\nPREVIOUS STORY CONTEXT:\n' + narrativeContext.previousSegments;
  }

  const userPrompt = initialPrompt 
    ? `Start a new ${storyMode || 'fantasy'} story: "${initialPrompt}"`
    : `Continue the story. User chose: "${choiceText}"${contextPrompt}${visualContextPrompt}${narrativeContextPrompt}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('OpenAI returned empty response');
    }
    
    const parsedResponse = JSON.parse(responseText);
    
    if (!parsedResponse.segmentText || !parsedResponse.choices) {
      throw new Error('OpenAI response missing required fields');
    }
    
    console.log('✅ OpenAI fallback generation successful');
    return parsedResponse;
    
  } catch (error) {
    console.error('❌ OpenAI fallback generation failed:', error);
    throw error;
  }
}

export { generateStoryContent };

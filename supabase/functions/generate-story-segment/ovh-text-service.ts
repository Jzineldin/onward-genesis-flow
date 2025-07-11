/**
 * OVH Public Cloud AI text generation using Qwen2.5-Coder-32B-Instruct
 * 
 * This service provides enhanced reasoning capabilities for educational storytelling
 * with improved context understanding and educational content integration.
 */

export interface OVHTextRequest {
  model: 'qwen2.5-coder-32b-instruct';
  messages: Array<{role: string; content: string}>;
  max_tokens: number;
  temperature: number;
  stream?: boolean;
}

export interface OVHTextResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate story content using OVH's Qwen2.5 model with enhanced educational features
 */
export async function generateStoryWithQwen(
  initialPrompt?: string,
  choiceText?: string,
  visualContext?: any,
  narrativeContext?: any,
  storyMode?: string,
  supabaseClient?: any
): Promise<any> {
  const OVH_API_TOKEN = Deno.env.get('OVH_API_TOKEN');
  
  console.log('🔍 OVH API Diagnostics:');
  console.log(`- Token available: ${OVH_API_TOKEN ? 'Yes' : 'No'}`);
  console.log(`- Token length: ${OVH_API_TOKEN ? OVH_API_TOKEN.length : 0} chars`);
  console.log(`- Token prefix: ${OVH_API_TOKEN ? OVH_API_TOKEN.substring(0, 8) + '...' : 'N/A'}`);
  
  if (!OVH_API_TOKEN) {
    console.error('❌ OVH_API_TOKEN not found in environment variables');
    throw new Error('OVH API token not available - check Supabase secrets configuration');
  }

  console.log('🤖 Generating story with OVH Qwen2.5-Coder-32B-Instruct...');

  // Build enhanced context for Qwen2.5's superior reasoning
  let contextPrompt = '';
  if (narrativeContext?.previousSegments) {
    contextPrompt = '\n\nPREVIOUS STORY CONTEXT:\n' + narrativeContext.previousSegments;
  }

  // Enhanced visual context for consistency
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

  // Enhanced narrative context with educational focus
  let narrativeContextPrompt = '';
  if (narrativeContext) {
    narrativeContextPrompt = `\n\nNARRATIVE CONTEXT:
- Story Summary: ${narrativeContext.summary || 'Educational adventure in progress'}
- Current Objective: ${narrativeContext.currentObjective || 'Continue the learning adventure'}
- Story Arc Stage: ${narrativeContext.arcStage || 'development'}
- Educational Focus: Learning through engaging storytelling`;
  }

  const systemPrompt = `You are TaleForge's advanced AI storyteller powered by Qwen2.5. Create engaging, educational, age-appropriate stories for children ages 4-14.

STORY REQUIREMENTS:
- Generate exactly 120-200 words for rich, detailed storytelling
- Create exactly 3 meaningful choices that advance both plot and learning
- Naturally weave educational content into the narrative
- Use age-appropriate language and themes
- Include detailed image descriptions for visual consistency
- DO NOT include choice prompts or transitions within the segmentText
- The segmentText should end naturally as part of the story narrative
- MAINTAIN CONSISTENCY with previous story segments and established characters
- CONTINUE the narrative flow naturally from the previous context

EDUCATIONAL INTEGRATION:
- Incorporate learning opportunities naturally into the story
- Include problem-solving scenarios appropriate for the age group
- Promote critical thinking through meaningful choices
- Foster creativity and imagination
- Ensure content is safe, positive, and inspiring

Response format (EXACT JSON):
{
  "segmentText": "A 120-200 word story segment with educational elements woven naturally into engaging narrative",
  "choices": ["Educational choice 1", "Learning-focused choice 2", "Character development choice 3"],
  "isEnd": false,
  "imagePrompt": "Detailed scene description for child-friendly, colorful, safe image generation",
  "visualContext": {"style": "children's book illustration", "characters": {"name": "description"}, "setting": "current location"},
  "narrativeContext": {"summary": "updated story summary", "currentObjective": "next learning goal", "arcStage": "current stage"},
  "educationalElements": ["learning objective 1", "skill developed", "concept explored"],
  "ageAppropriateness": "4-6|7-9|10-14",
  "readingLevel": "beginner|intermediate|advanced"
}`;

  const userPrompt = initialPrompt 
    ? `Start a new educational ${storyMode || 'fantasy'} story: "${initialPrompt}"`
    : `Continue the educational story. User chose: "${choiceText}"${contextPrompt}${visualContextPrompt}${narrativeContextPrompt}`;

  try {
    const requestBody = {
      inputs: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
      parameters: {
        max_new_tokens: 1500,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        return_full_text: false
      }
    };
    
    console.log('📡 OVH API Request Details:');
    console.log(`- URL: https://qwen2-5-coder-32b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/text_generation`);
    console.log(`- Method: POST`);
    console.log(`- Auth header length: ${OVH_API_TOKEN.length + 7} chars (Bearer + token)`);
    console.log(`- Request body size: ${JSON.stringify(requestBody).length} chars`);
    console.log(`- Input prompt length: ${requestBody.inputs.length} chars`);
    
    // Use OVHcloud AI Endpoints for text generation
    const response = await fetch('https://qwen2-5-coder-32b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/text_generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OVH_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📊 OVH API Response Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OVH Qwen2.5 API failed: ${response.status} - ${errorText}`);
      console.error(`📄 Full error response: ${errorText}`);
      
      // Handle specific error codes
      if (response.status === 401) {
        console.error('🔐 Authentication failed - check OVH API token validity');
        throw new Error('OVH authentication failed - invalid API token');
      } else if (response.status === 429) {
        console.error('⚠️ OVH Rate Limit Exceeded: You have exceeded the rate limit for OVHcloud AI Endpoints.');
        console.error('📊 Rate limits: Anonymous (2 req/min), Authenticated (400 req/min per project)');
        console.error('💡 Please wait before making another request or check your authentication.');
        throw new Error('OVH rate limit exceeded - please try again later');
      } else if (response.status >= 500) {
        console.error('🔥 OVH server error - their service may be temporarily unavailable');
        throw new Error('OVH server error - service temporarily unavailable');
      }
      
      throw new Error(`OVH Qwen2.5 API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 OVH Qwen2.5 raw response structure:', {
      hasGeneratedText: !!data.generated_text,
      isArray: Array.isArray(data),
      keys: Object.keys(data || {}),
      firstElementKeys: Array.isArray(data) && data[0] ? Object.keys(data[0]) : 'N/A'
    });
    console.log('📄 OVH Qwen2.5 raw response (first 500 chars):', JSON.stringify(data).substring(0, 500) + '...');
    
    // Extract generated text from OVH response format
    const generatedText = data.generated_text || data[0]?.generated_text || '';
    
    if (!generatedText) {
      console.error('❌ No generated text found in OVH response');
      console.error('📄 Full response structure:', JSON.stringify(data, null, 2));
      throw new Error('OVH Qwen2.5 returned empty response - check API format');
    }
    
    console.log(`📝 Generated text length: ${generatedText.length} chars`);
    console.log(`📝 Generated text preview: ${generatedText.substring(0, 200)}...`);
    
    // Parse JSON from the generated text
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse JSON from OVH response:', parseError);
      console.error('📄 Raw response:', generatedText);
      throw new Error('Failed to parse OVH response as JSON');
    }
    
    // Validate required fields
    if (!parsedResponse.segmentText || !parsedResponse.choices) {
      throw new Error('OVH response missing required fields');
    }
    
    console.log('✅ OVH Qwen2.5 story generation successful');
    console.log('📚 Educational elements:', parsedResponse.educationalElements);
    console.log('🎯 Age appropriateness:', parsedResponse.ageAppropriateness);
    
    return parsedResponse;
    
  } catch (error) {
    console.error('❌ OVH Qwen2.5 generation failed:', error);
    console.error('🔍 Error type:', error.constructor.name);
    console.error('📄 Error message:', error.message);
    console.error('📄 Error stack:', error.stack);
    
    // Provide more specific error context
    if (error.message.includes('Failed to fetch')) {
      console.error('🌐 Network error - check if OVH endpoint is accessible');
    } else if (error.message.includes('JSON')) {
      console.error('📊 JSON parsing error - OVH response format may have changed');
    }
    
    throw error;
  }
}
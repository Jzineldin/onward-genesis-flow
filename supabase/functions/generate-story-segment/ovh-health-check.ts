/**
 * OVH AI Service Health Check Utility
 * 
 * Provides basic connectivity and authentication testing for OVH AI endpoints
 */

export async function checkOVHHealth(): Promise<{
  isHealthy: boolean;
  error?: string;
  details: {
    tokenAvailable: boolean;
    endpointReachable: boolean;
    authenticationValid: boolean;
    responseTime?: number;
  };
}> {
  const OVH_API_TOKEN = Deno.env.get('OVH_API_TOKEN');
  
  const result = {
    isHealthy: false,
    details: {
      tokenAvailable: !!OVH_API_TOKEN,
      endpointReachable: false,
      authenticationValid: false,
    }
  };
  
  if (!OVH_API_TOKEN) {
    return {
      ...result,
      error: 'OVH API token not configured'
    };
  }
  
  try {
    const startTime = Date.now();
    
    // Test basic connectivity with a minimal request
    const response = await fetch('https://qwen2-5-coder-32b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/text_generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OVH_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        inputs: 'Test connectivity',
        parameters: {
          max_new_tokens: 10,
          temperature: 0.1,
          return_full_text: false
        }
      })
    });
    
    const responseTime = Date.now() - startTime;
    result.details.responseTime = responseTime;
    result.details.endpointReachable = true;
    
    if (response.status === 401) {
      result.details.authenticationValid = false;
      return {
        ...result,
        error: 'OVH API authentication failed - invalid token'
      };
    }
    
    if (response.status === 429) {
      result.details.authenticationValid = true;
      return {
        ...result,
        error: 'OVH API rate limit exceeded'
      };
    }
    
    if (response.ok) {
      result.details.authenticationValid = true;
      result.isHealthy = true;
      return result;
    }
    
    // Other HTTP errors
    const errorText = await response.text();
    return {
      ...result,
      error: `OVH API error: ${response.status} - ${errorText}`
    };
    
  } catch (error) {
    return {
      ...result,
      error: `Network error: ${error.message}`
    };
  }
}

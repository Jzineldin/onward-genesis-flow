
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface GenerationSettings {
  textProviders: {
    primary: string;
    fallback: string;
    wordCount: { min: number; max: number };
    geminiSettings: {
      model: string;
      temperature: number;
    };
    openaiSettings: {
      model: string;
      temperature: number;
    };
  };
  imageProviders: {
    primary: string;
    fallback: string;
    huggingFaceSettings: {
      model: string;
      steps: number;
      guidance_scale: number;
      width: number;
      height: number;
    };
    stableDiffusionSettings: {
      steps: number;
      dimensions: string;
    };
    dalleSettings: {
      model: string;
      quality: string;
      size: string;
    };
    replicateSettings: {
      model: string;
      steps: number;
      aspect_ratio: string;
      output_format: string;
    };
  };
  ttsProviders: {
    primary: string;
    voice: string;
    speed: number;
  };
}

const defaultSettings: GenerationSettings = {
  textProviders: {
    primary: 'gemini',
    fallback: 'openai',
    wordCount: { min: 120, max: 200 },
    geminiSettings: {
      model: 'gemini-1.5-flash-latest',
      temperature: 0.7,
    },
    openaiSettings: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
    },
  },
  imageProviders: {
    primary: 'openai',
    fallback: 'replicate',
    huggingFaceSettings: {
      model: 'black-forest-labs/FLUX.1-schnell',
      steps: 4,
      guidance_scale: 0.0,
      width: 1024,
      height: 1024,
    },
    stableDiffusionSettings: {
      steps: 20,
      dimensions: '1024x1024',
    },
    dalleSettings: {
      model: 'dall-e-3',
      quality: 'standard',
      size: '1024x1024',
    },
    replicateSettings: {
      model: 'flux-schnell',
      steps: 4,
      aspect_ratio: '1:1',
      output_format: 'webp',
    },
  },
  ttsProviders: {
    primary: 'openai',
    voice: 'fable',
    speed: 1.0,
  },
};

export async function getGenerationSettings(supabaseClient: SupabaseClient): Promise<GenerationSettings> {
  try {
    const { data, error } = await supabaseClient
      .from('admin_settings')
      .select('key, value')
      .in('key', ['text_providers', 'image_providers', 'tts_providers']);

    if (error) {
      console.log('Admin settings query error:', error.message);
      return defaultSettings;
    }

    if (!data || data.length === 0) {
      console.log('No admin settings found, using defaults');
      return defaultSettings;
    }

    const settings = { ...defaultSettings };
    
    data.forEach(setting => {
      try {
        const parsedValue = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        if (setting.key === 'text_providers') {
          settings.textProviders = { ...settings.textProviders, ...parsedValue };
        } else if (setting.key === 'image_providers') {
          settings.imageProviders = { ...settings.imageProviders, ...parsedValue };
        } else if (setting.key === 'tts_providers') {
          settings.ttsProviders = { ...settings.ttsProviders, ...parsedValue };
        }
      } catch (parseError) {
        console.log(`Failed to parse setting ${setting.key}:`, parseError);
      }
    });

    return settings;
  } catch (error) {
    console.log('Error loading admin settings, using defaults:', error);
    return defaultSettings;
  }
}

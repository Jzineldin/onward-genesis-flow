
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StorySegment } from './types';
import { isValidUUID, isProperUUID } from './utils';

export const useStoryLoader = () => {
  const loadExistingStory = useCallback(async (
    id: string | undefined,
    setAllStorySegments: (segments: StorySegment[]) => void,
    setCurrentStorySegment: (segment: StorySegment) => void,
    setSegmentCount: (count: number) => void,
    setViewMode: (mode: 'create' | 'player') => void
  ): Promise<boolean> => {
    // Only try to load if the ID is valid and looks like a UUID (not a custom ID)
    if (!id || !isValidUUID(id)) {
      console.log('ID is not valid, skipping story load:', id);
      return false;
    }

    // Skip database queries for custom IDs that aren't proper UUIDs
    if (!isProperUUID(id)) {
      console.log('ID is a custom ID, not querying database:', id);
      return false;
    }

    try {
      const { data: segments, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (segments && segments.length > 0) {
        // Map database segments to TypeScript interface
        const enhancedSegments: StorySegment[] = segments.map(segment => ({
          ...segment,
          storyId: segment.story_id,
          text: segment.segment_text,
          imageUrl: segment.image_url || '',
          audioUrl: segment.audio_url || undefined,
          isEnd: segment.is_end,
          audio_generation_status: segment.audio_generation_status || 'not_started',
          word_count: segment.word_count || segment.segment_text?.split(/\s+/).length || 0
        }));
        
        setAllStorySegments(enhancedSegments);
        setCurrentStorySegment(enhancedSegments[enhancedSegments.length - 1]);
        // Set proper segment count (segments.length, not segments.length - 1)
        setSegmentCount(enhancedSegments.length);
        setViewMode('player');
        
        console.log('📖 Successfully loaded existing story with', enhancedSegments.length, 'segments');
        return true;
      }
      
      console.log('📖 No existing segments found for story:', id);
      return false;
    } catch (error) {
      console.error('Error loading existing story:', error);
      toast.error('Failed to load story');
      return false;
    }
  }, []);

  return { loadExistingStory };
};

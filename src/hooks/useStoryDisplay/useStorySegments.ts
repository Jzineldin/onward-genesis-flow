import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StorySegment } from './types';
import { isProperUUID } from './utils';

export const useStorySegments = () => {
  const [currentStorySegment, setCurrentStorySegment] = useState<StorySegment | null>(null);
  const [allStorySegments, setAllStorySegments] = useState<StorySegment[]>([]);
  const [segmentCount, setSegmentCount] = useState(0);

  // Refetch story segments when switching modes to ensure data is fresh
  const refetchStorySegments = async (storyId: string, fetchStoryData: (id: string) => Promise<void>) => {
    // Only refetch for proper UUIDs
    if (!storyId || !isProperUUID(storyId)) return;
    
    console.log('🔄 Refetching story segments for mode switch...');
    try {
      const { data: segments, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (segments && segments.length > 0) {
        const enhancedSegments = segments.map(segment => ({
          ...segment,
          audio_generation_status: segment.audio_generation_status || 'not_started',
          word_count: segment.word_count || segment.segment_text?.split(/\s+/).length || 0
        })) as StorySegment[];
        
        console.log('🔄 Refreshed segments:', enhancedSegments.map(s => ({ 
          id: s.id, 
          hasAudio: !!s.audio_url,
          audioStatus: s.audio_generation_status 
        })));
        
        setAllStorySegments(enhancedSegments);
        setCurrentStorySegment(enhancedSegments[enhancedSegments.length - 1]);
        setSegmentCount(enhancedSegments.length);
      }
      
      // Also refetch story data when refetching segments
      await fetchStoryData(storyId);
    } catch (error) {
      console.error('Error refetching story segments:', error);
    }
  };

  return {
    currentStorySegment,
    setCurrentStorySegment,
    allStorySegments,
    setAllStorySegments,
    segmentCount,
    setSegmentCount,
    refetchStorySegments,
  };
};
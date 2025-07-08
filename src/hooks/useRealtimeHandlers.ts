
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeHandlers = (
    storyId: string,
    forceRefresh: () => void,
    updateLastUpdateTime: () => void
) => {
    const queryClient = useQueryClient();

    const handleRealtimeUpdate = useCallback((payload: any) => {
        console.log('[DBG] WS payload', payload); // ← DEBUG LOG
        console.log('🔥 payload', payload.new?.id, payload.new?.image_url);
        
        // Guard against empty image URLs
        if (!payload.new?.image_url) return;
        
        const segmentId = payload.new?.id;
        if (!segmentId) return;
        
        // Get current cached data to compare URLs
        const currentData = queryClient.getQueryData(['segment', segmentId]);
        const currentImageUrl = (currentData as any)?.image_url;
        
        // Only proceed if the image URL has actually changed
        if (payload.new.image_url !== currentImageUrl) {
            console.log('🔄 Image URL changed, updating cache directly:', {
                segmentId,
                oldUrl: currentImageUrl,
                newUrl: payload.new.image_url
            });
            
            // Overwrite React-Query cache directly rather than invalidate
            queryClient.setQueryData(['segment', segmentId], payload.new);
            
            // Also update the story cache to ensure consistency
            queryClient.setQueryData(['story', storyId], (oldStoryData: any) => {
                if (!oldStoryData) return oldStoryData;
                
                return {
                    ...oldStoryData,
                    story_segments: oldStoryData.story_segments?.map((segment: any) => 
                        segment.id === segmentId ? { ...segment, ...payload.new } : segment
                    )
                };
            });
            
            updateLastUpdateTime();
            forceRefresh();
        }
        
        // ENHANCED: Multiple refresh strategy for critical updates
        if ((payload.new as any)?.image_generation_status === 'completed') {
            console.log('🖼️ Image generation completed - aggressive refresh strategy');
            
            // Immediate refresh
            forceRefresh();
            
            // Staggered refreshes to ensure UI updates
            setTimeout(() => {
                console.log('🔄 Secondary refresh (200ms)');
                queryClient.invalidateQueries({ queryKey: ['story', storyId] });
                forceRefresh();
            }, 200);
            
            setTimeout(() => {
                console.log('🔄 Tertiary refresh (500ms)');
                queryClient.refetchQueries({ queryKey: ['story', storyId] });
                forceRefresh();
            }, 500);
            
            setTimeout(() => {
                console.log('🔄 Final refresh (1000ms)');
                queryClient.invalidateQueries({ queryKey: ['story', storyId] });
                queryClient.refetchQueries({ queryKey: ['story', storyId] });
            }, 1000);
        }
    }, [queryClient, storyId, forceRefresh, updateLastUpdateTime]);

    const handleStoryUpdate = useCallback((payload: any) => {
        console.log('🔥 REALTIME HANDLER - Processing story table update:', {
            storyId,
            audioStatus: (payload.new as any)?.audio_generation_status,
            audioUrl: (payload.new as any)?.full_story_audio_url ? 'Present' : 'Missing',
            isCompleted: (payload.new as any)?.is_completed,
            timestamp: new Date().toISOString()
        });
        
        updateLastUpdateTime();
        
        // Force immediate refresh for story updates
        forceRefresh();
        
        // Additional refresh for audio completion
        if ((payload.new as any)?.audio_generation_status === 'completed') {
            console.log('🎵 Audio generation completed - forcing multiple refreshes');
            setTimeout(() => forceRefresh(), 200);
            setTimeout(() => forceRefresh(), 500);
            setTimeout(() => forceRefresh(), 1000);
        }
    }, [storyId, forceRefresh, updateLastUpdateTime]);

    return {
        handleRealtimeUpdate,
        handleStoryUpdate
    };
};

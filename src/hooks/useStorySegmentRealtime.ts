
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStorySegmentRealtime = (segmentId: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!segmentId || segmentId === 'fallback') {
            console.warn('Invalid segment ID – skipping realtime:', segmentId);
            return;
        }

        console.log(`🔔 Setting up realtime subscription for segment: ${segmentId}`);
        
        const forceImageRefresh = (newData: any) => {
            console.log(`🔄 FORCE IMAGE REFRESH for segment: ${segmentId}`, {
                imageUrl: newData.image_url,
                status: newData.image_generation_status
            });
            
            // 1. Immediately update segment cache
            queryClient.setQueryData(['segment', segmentId], newData);
            
            // 2. Update story cache
            queryClient.setQueryData(['story', newData.story_id], (oldStoryData: any) => {
                if (!oldStoryData) return oldStoryData;
                
                return {
                    ...oldStoryData,
                    story_segments: oldStoryData.story_segments?.map((segment: any) => 
                        segment.id === segmentId ? { ...segment, ...newData } : segment
                    ) || [newData]
                };
            });
            
            // 3. Force multiple invalidations
            queryClient.invalidateQueries({ queryKey: ['segment', segmentId] });
            queryClient.invalidateQueries({ queryKey: ['story', newData.story_id] });
            
            // 4. Custom event to force image component refresh
            const refreshEvent = new CustomEvent('force-image-refresh', { 
                detail: { 
                    segmentId, 
                    imageUrl: newData.image_url,
                    timestamp: Date.now()
                } 
            });
            window.dispatchEvent(refreshEvent);
            
            // 5. Additional refresh waves
            setTimeout(() => {
                queryClient.refetchQueries({ queryKey: ['segment', segmentId] });
                window.dispatchEvent(new CustomEvent('force-image-refresh', { 
                    detail: { segmentId, imageUrl: newData.image_url, timestamp: Date.now() } 
                }));
            }, 100);
            
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['story', newData.story_id] });
                window.dispatchEvent(new CustomEvent('force-image-refresh', { 
                    detail: { segmentId, imageUrl: newData.image_url, timestamp: Date.now() } 
                }));
            }, 500);
        };

        const ch = supabase
            .channel(`segment-${segmentId}`)
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'story_segments', filter: `id=eq.${segmentId}` },
                (payload) => { 
                    console.log('🔥 REALTIME UPDATE:', segmentId, {
                        imageUrl: payload.new?.image_url,
                        status: payload.new?.image_generation_status
                    });
                    
                    if (payload.new) {
                        forceImageRefresh(payload.new);
                    }
                })
            .subscribe(s => console.log('[Segment Realtime]', segmentId, s));

        return () => {
            console.log(`🧹 Cleaning up realtime subscription for segment: ${segmentId}`);
            supabase.removeChannel(ch);
        };
    }, [segmentId, queryClient]);
};

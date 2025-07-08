import { toast } from 'sonner';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { useFinishStoryInline } from './useFinishStoryInline';
import { StorySegment } from './useStoryState';
import { supabase } from '@/integrations/supabase/client';

interface UseStoryActionsProps {
  setError: (error: string | null) => void;
  setIsGeneratingStartup: (loading: boolean) => void;
  setIsGeneratingChoice: (loading: boolean) => void;
  setIsGeneratingEnding: (loading: boolean) => void;
  setCurrentSegment: (segment: StorySegment | null) => void;
  setStoryHistory: (history: StorySegment[] | ((prev: StorySegment[]) => StorySegment[])) => void;
  setApiCallsCount: (count: number | ((prev: number) => number)) => void;
  setFullStoryAudioUrl: (url: string | null) => void;
  setShowImageSettings: (show: boolean) => void;
  generationStartedRef: React.MutableRefObject<boolean>;
  skipImage: boolean;
  selectedVoice: string;
  currentSegment: StorySegment | null;
}

export const useStoryActions = ({
  setError,
  setIsGeneratingStartup,
  setIsGeneratingChoice,
  setIsGeneratingEnding,
  setCurrentSegment,
  setStoryHistory,
  setApiCallsCount,
  setFullStoryAudioUrl,
  setShowImageSettings,
  generationStartedRef,
  skipImage,
  selectedVoice,
  currentSegment,
}: UseStoryActionsProps) => {
  const { generateSegment } = useStoryGeneration();
  const generateAudioMutation = useGenerateFullStoryAudio();
  const finishStoryMutation = useFinishStoryInline();

  const handleStartStory = async (prompt: string, mode: string) => {
    if (generationStartedRef.current && currentSegment) {
      console.log('⚠️ Story generation already in progress or completed');
      return;
    }

    try {
      console.log('🎬 Starting story generation with:', { prompt, mode, skipImage });
      setError(null);
      setIsGeneratingStartup(true);
      setShowImageSettings(false);
      setApiCallsCount(prev => prev + 1);
      
      const data = await generateSegment({
        prompt,
        genre: mode,
        skipImage,
        skipAudio: true
      });

      console.log('✅ Story generation successful:', data);

      const segmentData: StorySegment = {
        storyId: data.story_id,
        text: data.segment_text,
        imageUrl: data.image_url || '/placeholder.svg',
        choices: data.choices || [],
        isEnd: data.is_end || false,
        imageGenerationStatus: data.image_generation_status,
        segmentId: data.id
      };

      setCurrentSegment(segmentData);
      setStoryHistory([segmentData]);
      setIsGeneratingStartup(false);
      toast.success('Story started successfully!');
    } catch (error: any) {
      console.error('❌ Story generation failed:', error);
      setError(error.message || 'Failed to generate story');
      setIsGeneratingStartup(false);
      setShowImageSettings(true);
      generationStartedRef.current = false;
      toast.error(`Failed to generate story: ${error.message}`);
    }
  };

  const handleSelectChoice = async (choice: string) => {
    if (!currentSegment) return;

    try {
      setError(null);
      setIsGeneratingChoice(true);
      setApiCallsCount(prev => prev + 1);
      
      const data = await generateSegment({
        storyId: currentSegment.storyId,
        parentSegmentId: currentSegment.segmentId,
        choiceText: choice,
        skipImage,
        skipAudio: true
      });

      const segmentData: StorySegment = {
        storyId: data.story_id,
        text: data.segment_text,
        imageUrl: data.image_url || '/placeholder.svg',
        choices: data.choices || [],
        isEnd: data.is_end || false,
        imageGenerationStatus: data.image_generation_status,
        segmentId: data.id
      };

      setCurrentSegment(segmentData);
      setStoryHistory(prev => [...prev, segmentData]);
      setIsGeneratingChoice(false);
      toast.success('Story continued successfully!');
    } catch (error: any) {
      console.error('❌ Choice selection failed:', error);
      setError(error.message || 'Failed to continue story');
      setIsGeneratingChoice(false);
      toast.error(`Failed to continue story: ${error.message}`);
    }
  };

  const handleFinishStory = async (skipEndingImage?: boolean, onStoryCompleted?: (storyId: string) => void) => {
    if (!currentSegment?.storyId) {
      toast.error('Cannot finish story: No story ID found');
      return;
    }

    try {
      setError(null);
      setIsGeneratingEnding(true);
      
      console.log('🏁 Starting story finish process for:', currentSegment.storyId);
      console.log('📸 Skip ending image:', skipEndingImage);
      
      const result = await finishStoryMutation.mutateAsync({
        storyId: currentSegment.storyId,
        skipImage: skipEndingImage || false
      });
      
      if (result?.endingSegment) {
        const endingSegmentData: StorySegment = {
          storyId: result.endingSegment.story_id,
          text: result.endingSegment.segment_text,
          imageUrl: result.endingSegment.image_url || '/placeholder.svg',
          choices: [],
          isEnd: true,
          imageGenerationStatus: result.endingSegment.image_generation_status || 'completed',
          segmentId: result.endingSegment.id
        };

        setCurrentSegment(endingSegmentData);
        setStoryHistory(prev => [...prev, endingSegmentData]);
        console.log('✅ Story ending applied successfully');

        // Mark story as completed in database and trigger callback
        await markStoryAsCompleted(currentSegment.storyId);
        if (onStoryCompleted) {
          onStoryCompleted(currentSegment.storyId);
        }
      }
      
      setIsGeneratingEnding(false);
    } catch (error: any) {
      console.error('❌ Story finishing failed:', error);
      setError(error.message || 'Failed to generate story ending');
      setIsGeneratingEnding(false);
    }
  };

  const markStoryAsCompleted = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_completed: true })
        .eq('id', storyId);

      if (error) {
        console.error('❌ Error marking story as completed:', error);
      } else {
        console.log('✅ Story marked as completed in database');
      }
    } catch (error) {
      console.error('❌ Failed to mark story as completed:', error);
    }
  };

  const handleGenerateAudio = async () => {
    if (!currentSegment?.storyId) return;

    try {
      console.log('🎵 Starting audio generation for story:', currentSegment.storyId);
      
      const data = await generateAudioMutation.mutateAsync({
        storyId: currentSegment.storyId,
        voiceId: selectedVoice
      });

      if (data?.audioUrl) {
        setFullStoryAudioUrl(data.audioUrl);
        toast.success('Audio generated successfully!');
      }
    } catch (error: any) {
      console.error('🚨 Audio generation failed:', error);
      toast.error(`Failed to generate audio: ${error.message}`);
    }
  };

  return {
    handleStartStory,
    handleSelectChoice,
    handleFinishStory,
    handleGenerateAudio,
    generateAudioMutation,
  };
};

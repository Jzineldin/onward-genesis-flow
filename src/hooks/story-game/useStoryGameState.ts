
import { useCallback } from 'react';
import { useStoryCreation } from '@/context/StoryCreationContext';
import { StorySegmentRow } from '@/types/stories';
import { toast } from 'sonner';

export const useStoryGameState = () => {
  const {
    gameState,
    currentSegment,
    storyHistory,
    isLoading,
    isFinishingStory,
    isStoryCompleted,
    setGameState,
    setCurrentSegment,
    setStoryHistory,
    setIsLoading,
    setIsFinishingStory,
    setIsStoryCompleted,
    resetStoryState
  } = useStoryCreation();

  const handleSuccessfulGeneration = useCallback((data: StorySegmentRow) => {
    console.log('🎉 Story generation successful:', data);
    setCurrentSegment(data);
    setStoryHistory([...storyHistory, data]);
    setGameState('playing');
    setIsLoading(false);
    
    if (data.is_end) {
      console.log('📖 Story marked as ended');
      setGameState('completed');
      setIsStoryCompleted(true);
    }
    
    toast.success('Story segment generated successfully!');
  }, [storyHistory, setCurrentSegment, setStoryHistory, setGameState, setIsLoading, setIsStoryCompleted]);

  const handleGenerationError = useCallback((error: Error) => {
    console.error('❌ Story generation failed:', error);
    setIsLoading(false);
    setGameState('not_started');
    toast.error(`Story generation failed: ${error.message}`);
  }, [setIsLoading, setGameState]);

  const handleRestart = useCallback(() => {
    console.log('🔄 Restarting story game');
    resetStoryState();
  }, [resetStoryState]);

  return {
    // State
    gameState,
    currentSegment,
    storyHistory,
    isLoading,
    isFinishingStory,
    isStoryCompleted,
    
    // Actions
    setGameState,
    setCurrentSegment,
    setStoryHistory,
    setIsLoading,
    setIsFinishingStory,
    setIsStoryCompleted,
    handleSuccessfulGeneration,
    handleGenerationError,
    handleRestart
  };
};

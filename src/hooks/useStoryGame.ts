
import { useState, useCallback } from 'react';
import { useStoryGeneration } from './useStoryGeneration';

export const useStoryGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [storyHistory, setStoryHistory] = useState<any[]>([]);
  const [currentSegment, setCurrentSegment] = useState<any>(null);

  const { generateSegment, isGenerating } = useStoryGeneration();

  const handleStoryGeneration = useCallback(async (options: any) => {
    try {
      const data = await generateSegment(options);
      console.log('Story generation response:', data);
      
      // Ensure we include the segment ID in the current segment
      const segmentData = {
        id: data.id,
        storyId: data.story_id,
        text: data.segment_text,
        imageUrl: data.image_url || '/placeholder.svg',
        choices: data.choices || [],
        isEnd: data.is_end || false,
        imageGenerationStatus: data.image_generation_status,
        segmentId: data.id, // Make sure to include the actual segment ID
        parentSegmentId: data.parent_segment_id,
        triggeringChoiceText: data.triggering_choice_text
      };

      setCurrentSegment(segmentData);
      setStoryHistory(prev => [...prev, segmentData]);
      setGameState('playing');

      console.log('Story started successfully');
    } catch (error) {
      console.error('Story generation failed:', error);
      setGameState('idle');
    }
  }, [generateSegment]);

  const startStory = useCallback((prompt: string, storyMode?: string) => {
    console.log('Starting story with prompt:', prompt);
    handleStoryGeneration({ 
      storyId: '', // Will be generated
      prompt, 
      storyMode 
    });
  }, [handleStoryGeneration]);

  const selectChoice = useCallback((choice: string) => {
    if (!currentSegment) return;
    
    console.log('Selecting choice:', choice);
    handleStoryGeneration({
      storyId: currentSegment.storyId,
      parentSegmentId: currentSegment.id,
      choice: choice
    });
  }, [currentSegment, handleStoryGeneration]);

  const finishStory = useCallback(() => {
    console.log('Finishing story');
    setGameState('finished');
  }, []);

  const restartStory = useCallback(() => {
    console.log('Restarting story');
    setGameState('idle');
    setStoryHistory([]);
    setCurrentSegment(null);
  }, []);

  return {
    gameState,
    currentSegment,
    storyHistory,
    isLoading: isGenerating,
    startStory,
    selectChoice,
    finishStory,
    restartStory
  };
};

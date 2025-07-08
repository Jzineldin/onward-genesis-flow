
import { useNavigate } from 'react-router-dom';
import { useStoryGeneration } from '@/hooks/useStoryGeneration';
import { useStoryState } from '@/hooks/useStoryState';
import { useStoryActions } from './useStoryDisplay/useStoryActions';
import { useStoryData } from './useStoryDisplay/useStoryData';
import { useStorySegments } from './useStoryDisplay/useStorySegments';
import { useStoryUIState } from './useStoryDisplay/useStoryUIState';
import { useStoryInitialization } from './useStoryDisplay/useStoryInitialization';
import { useStoryHandlers } from './useStoryDisplay/useStoryHandlers';
import { useStoryInitializationLogic } from './useStoryDisplay/useStoryInitializationLogic';

export const useStoryDisplay = () => {
  const navigate = useNavigate();
  
  const storyGeneration = useStoryGeneration();
  const {
    apiUsageCount,
    showCostDialog,
    pendingAction,
    pendingParams,
    setShowCostDialog,
    setPendingAction,
    incrementApiUsage,
    addToHistory
  } = useStoryState();

  const { confirmGeneration, handleFinishStory } = useStoryActions(
    storyGeneration,
    addToHistory,
    incrementApiUsage
  );

  const {
    maxSegments,
    skipImage,
    setSkipImage,
    skipAudio,
    setSkipAudio,
    audioPlaying,
    setAudioPlaying,
    error,
    setError,
    showHistory,
    setShowHistory,
    viewMode,
    handleViewModeChange,
  } = useStoryUIState();

  const {
    currentStorySegment,
    setCurrentStorySegment,
    allStorySegments,
    setAllStorySegments,
    segmentCount,
    setSegmentCount,
    refetchStorySegments,
  } = useStorySegments();

  const { id, genre, prompt, characterName, isInitialLoad, setIsInitialLoad, storyLoaded, setStoryLoaded } = useStoryInitialization();

  const { storyData, fetchStoryData, refreshStoryData } = useStoryData(id);

  const { showConfirmation, handleConfirmGeneration, handleChoiceSelect, handleStoryFinish } = useStoryHandlers({
    maxSegments,
    segmentCount,
    currentStorySegment,
    genre,
    prompt,
    characterName,
    skipImage,
    storyGeneration,
    showCostDialog,
    pendingAction,
    pendingParams,
    setShowCostDialog,
    setPendingAction,
    setError,
    setCurrentStorySegment,
    setAllStorySegments,
    setSegmentCount,
    confirmGeneration,
    handleFinishStory,
  });

  // Enhanced view mode change that refetches data
  const setViewMode = async (newMode: 'create' | 'player') => {
    await handleViewModeChange(newMode, () => refetchStorySegments(id!, fetchStoryData));
  };

  // Initialize story loading logic - only run when we have stable data
  useStoryInitializationLogic({
    id,
    prompt,
    currentStorySegment,
    isInitialLoad,
    setIsInitialLoad,
    storyLoaded,
    setStoryLoaded,
    setAllStorySegments,
    setCurrentStorySegment,
    setSegmentCount,
    setViewMode: (mode: 'create' | 'player') => handleViewModeChange(mode, async () => {}),
    fetchStoryData,
    showConfirmation,
  });

  return {
    // State
    currentStorySegment,
    allStorySegments,
    segmentCount,
    maxSegments,
    skipImage,
    skipAudio,
    audioPlaying,
    error,
    showHistory,
    viewMode,
    
    // Story data
    storyData,
    
    // Story generation state
    storyGeneration,
    apiUsageCount,
    showCostDialog,
    pendingAction,
    pendingParams,
    
    // URL params
    genre,
    prompt,
    characterName,
    
    // Actions
    setSkipImage,
    setSkipAudio,
    setAudioPlaying,
    setError,
    setShowHistory,
    setViewMode, // Enhanced version that refetches data
    setShowCostDialog,
    showConfirmation,
    confirmGeneration: handleConfirmGeneration,
    handleChoiceSelect,
    handleFinishStory: handleStoryFinish,
    refreshStoryData,
    
    // Navigation
    navigate
  };
};

// Export the StorySegment type for use in components
export type { StorySegment } from './useStoryDisplay/types';
export type { StoryData } from './useStoryDisplay/useStoryData';

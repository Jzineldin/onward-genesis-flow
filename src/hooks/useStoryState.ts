
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoryState {
  currentStoryId: string | null;
  currentSegment: any | null;
  storyHistory: any[];
  apiUsageCount: number;
  showCostDialog: boolean;
  pendingAction: 'start' | 'choice' | null;
  pendingParams: any;
  
  setCurrentStory: (storyId: string) => void;
  setCurrentSegment: (segment: any) => void;
  addToHistory: (segment: any) => void;
  incrementApiUsage: () => void;
  setShowCostDialog: (show: boolean) => void;
  setPendingAction: (action: 'start' | 'choice' | null, params?: any) => void;
  resetState: () => void;
}

export const useStoryState = create<StoryState>()(
  persist(
    (set, get) => ({
      currentStoryId: null,
      currentSegment: null,
      storyHistory: [],
      apiUsageCount: 0,
      showCostDialog: false,
      pendingAction: null,
      pendingParams: null,

      setCurrentStory: (storyId) => set({ currentStoryId: storyId }),
      
      setCurrentSegment: (segment) => set({ currentSegment: segment }),
      
      addToHistory: (segment) => set((state) => ({
        storyHistory: [...state.storyHistory, segment]
      })),
      
      incrementApiUsage: () => set((state) => ({
        apiUsageCount: state.apiUsageCount + 1
      })),
      
      setShowCostDialog: (show) => set({ showCostDialog: show }),
      
      setPendingAction: (action, params = null) => set({
        pendingAction: action,
        pendingParams: params
      }),
      
      resetState: () => set({
        currentStoryId: null,
        currentSegment: null,
        storyHistory: [],
        showCostDialog: false,
        pendingAction: null,
        pendingParams: null
      })
    }),
    {
      name: 'story-state',
      partialize: (state) => ({
        apiUsageCount: state.apiUsageCount,
        storyHistory: state.storyHistory
      })
    }
  )
);

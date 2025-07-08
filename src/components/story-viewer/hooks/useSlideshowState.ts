
import { useState, useEffect } from 'react';
import { StorySegmentRow } from '@/types/stories';

interface UseSlideshowStateProps {
  segments: StorySegmentRow[];
  fullStoryAudioUrl?: string;
  isOpen: boolean;
}

export const useSlideshowState = ({ segments, fullStoryAudioUrl, isOpen }: UseSlideshowStateProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Auto-start slideshow when audio is available
  useEffect(() => {
    if (isOpen && fullStoryAudioUrl && !isPlaying) {
      console.log('🎬 Auto-starting slideshow with audio');
      setIsPlaying(true);
    }
  }, [isOpen, fullStoryAudioUrl]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % segments.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + segments.length) % segments.length);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return {
    currentSlide,
    isPlaying,
    autoAdvance,
    setCurrentSlide,
    setIsPlaying,
    setAutoAdvance,
    nextSlide,
    prevSlide,
    togglePlayback,
    goToSlide,
  };
};

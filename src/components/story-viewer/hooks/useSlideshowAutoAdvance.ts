
import { useEffect } from 'react';
import { StorySegmentRow } from '@/types/stories';

interface UseSlideshowAutoAdvanceProps {
  isPlaying: boolean;
  autoAdvance: boolean;
  segments: StorySegmentRow[];
  currentSlide: number;
  setCurrentSlide: (value: number | ((prev: number) => number)) => void;
  setIsPlaying: (value: boolean) => void;
}

export const useSlideshowAutoAdvance = ({
  isPlaying,
  autoAdvance,
  segments,
  currentSlide,
  setCurrentSlide,
  setIsPlaying,
}: UseSlideshowAutoAdvanceProps) => {
  useEffect(() => {
    if (!isPlaying || !autoAdvance || segments.length <= 1) return;
    
    // Calculate timing based on text length (approximate reading time)
    const currentSegment = segments[currentSlide];
    const wordCount = currentSegment?.segment_text?.split(' ').length || 100;
    const readingTime = Math.max(5000, wordCount * 200); // Minimum 5 seconds, ~200ms per word
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % segments.length;
        // If we've completed a full cycle, pause the slideshow
        if (nextSlide === 0 && prev === segments.length - 1) {
          setIsPlaying(false);
        }
        return nextSlide;
      });
    }, readingTime);

    return () => clearInterval(interval);
  }, [isPlaying, autoAdvance, segments.length, currentSlide, setCurrentSlide, setIsPlaying]);
};

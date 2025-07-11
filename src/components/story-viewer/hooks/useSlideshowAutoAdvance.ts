
import { useEffect, useRef } from 'react';
import { StorySegmentRow } from '@/types/stories';

interface UseSlideshowAutoAdvanceProps {
  isPlaying: boolean;
  autoAdvance: boolean;
  segments: StorySegmentRow[];
  currentSlide: number;
  setCurrentSlide: (value: number | ((prev: number) => number)) => void;
  setIsPlaying: (value: boolean) => void;
  fullStoryAudioUrl?: string;
}

export const useSlideshowAutoAdvance = ({
  isPlaying,
  autoAdvance,
  segments,
  currentSlide,
  setCurrentSlide,
  setIsPlaying,
  fullStoryAudioUrl,
}: UseSlideshowAutoAdvanceProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSlideChangeTime = useRef<number>(0);
  const segmentDurations = useRef<number[]>([]);

  // Initialize audio and calculate segment durations based on text length
  useEffect(() => {
    if (fullStoryAudioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(fullStoryAudioUrl);
        audioRef.current.preload = 'metadata';
      }

      // Calculate approximate segment durations based on text length
      const totalWords = segments.reduce((sum, seg) => sum + (seg.segment_text?.split(' ').length || 0), 0);
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        const totalDuration = audioRef.current?.duration || 0;
        
        // Distribute total duration across segments based on their text length
        segmentDurations.current = segments.map(segment => {
          const segmentWords = segment.segment_text?.split(' ').length || 0;
          const proportion = segmentWords / totalWords;
          return Math.max(3, totalDuration * proportion); // Minimum 3 seconds per segment
        });
        
        console.log('🎵 Slideshow: Audio duration calculated', {
          totalDuration,
          segmentDurations: segmentDurations.current,
          averageDuration: segmentDurations.current.reduce((a, b) => a + b, 0) / segments.length
        });
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [fullStoryAudioUrl, segments]);

  // Sync slideshow with audio playback
  useEffect(() => {
    if (!isPlaying || !autoAdvance || segments.length <= 1 || !fullStoryAudioUrl) return;

    let interval: NodeJS.Timeout;

    if (audioRef.current && segmentDurations.current.length > 0) {
      // Use audio-based timing
      console.log('🎵 Slideshow: Using audio-based timing for slide', currentSlide);
      
      const currentSegmentDuration = segmentDurations.current[currentSlide];
      const durationMs = currentSegmentDuration * 1000;
      
      // Start audio if it's not playing
      if (audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.error('🎵 Slideshow: Failed to play audio:', err);
          // Fallback to reading time if audio fails
          return;
        });
      }

      lastSlideChangeTime.current = Date.now();
      
      interval = setTimeout(() => {
        setCurrentSlide((prev) => {
          const nextSlide = (prev + 1) % segments.length;
          
          console.log('🎵 Slideshow: Auto-advancing from slide', prev, 'to', nextSlide);
          
          // If we've completed a full cycle, pause the slideshow and audio
          if (nextSlide === 0 && prev === segments.length - 1) {
            console.log('🎵 Slideshow: Completed full cycle, stopping');
            setIsPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
          
          return nextSlide;
        });
      }, durationMs);
    } else {
      // Fallback to reading time-based timing if no audio
      console.log('🎵 Slideshow: Using reading time fallback for slide', currentSlide);
      
      const currentSegment = segments[currentSlide];
      const wordCount = currentSegment?.segment_text?.split(' ').length || 100;
      const readingTime = Math.max(5000, wordCount * 250); // Slightly slower reading pace
      
      interval = setTimeout(() => {
        setCurrentSlide((prev) => {
          const nextSlide = (prev + 1) % segments.length;
          
          // If we've completed a full cycle, pause the slideshow
          if (nextSlide === 0 && prev === segments.length - 1) {
            setIsPlaying(false);
          }
          
          return nextSlide;
        });
      }, readingTime);
    }

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [isPlaying, autoAdvance, segments.length, currentSlide, setCurrentSlide, setIsPlaying, fullStoryAudioUrl]);

  // Pause/resume audio when slideshow is paused/resumed
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(err => {
            console.error('🎵 Slideshow: Failed to resume audio:', err);
          });
        }
      } else {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying]);
};

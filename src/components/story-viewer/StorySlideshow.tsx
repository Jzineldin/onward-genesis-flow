
import React from 'react';
import { StorySegmentRow } from '@/types/stories';
import { useSlideshowState } from './hooks/useSlideshowState';
import { useSlideshowAutoAdvance } from './hooks/useSlideshowAutoAdvance';
import SlideshowHeader from './SlideshowHeader';
import SlideshowContent from './SlideshowContent';
import SlideshowNavigation from './SlideshowNavigation';

interface StorySlideshowProps {
  segments: StorySegmentRow[];
  fullStoryAudioUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

const StorySlideshow: React.FC<StorySlideshowProps> = ({ 
  segments, 
  fullStoryAudioUrl, 
  isOpen, 
  onClose 
}) => {
  const {
    currentSlide,
    isPlaying,
    autoAdvance,
    setCurrentSlide,
    setIsPlaying,
    nextSlide,
    prevSlide,
    togglePlayback,
    goToSlide,
  } = useSlideshowState({ segments, fullStoryAudioUrl, isOpen });

  useSlideshowAutoAdvance({
    isPlaying,
    autoAdvance,
    segments,
    currentSlide,
    setCurrentSlide,
    setIsPlaying,
    fullStoryAudioUrl,
  });

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen || segments.length === 0) return null;

  const currentSegment = segments[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col story-slideshow-mobile"
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(15, 23, 42, 0.95) 0%, 
            rgba(30, 41, 59, 0.90) 25%,
            rgba(51, 65, 85, 0.85) 50%,
            rgba(71, 85, 105, 0.90) 75%,
            rgba(15, 23, 42, 0.95) 100%
          ),
          radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
          url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')
        `,
        backgroundSize: 'cover, 100% 100%, 100% 100%, cover',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'normal, overlay, overlay, normal'
      }}
    >
      <SlideshowHeader
        currentSlide={currentSlide}
        totalSlides={segments.length}
        isPlaying={isPlaying}
        onTogglePlayback={togglePlayback}
      />

      <SlideshowContent
        currentSegment={currentSegment}
        currentSlide={currentSlide}
      />

      <SlideshowNavigation
        segments={segments}
        currentSlide={currentSlide}
        onClose={handleClose}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
        onGoToSlide={goToSlide}
      />

      {/* Audio is now handled internally by useSlideshowAutoAdvance for better timing sync */}
    </div>
  );
};

export default StorySlideshow;

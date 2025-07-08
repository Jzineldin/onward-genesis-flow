
import React from 'react';
import { StorySegmentRow } from '@/types/stories';
import { useSlideshowState } from './hooks/useSlideshowState';
import { useSlideshowAutoAdvance } from './hooks/useSlideshowAutoAdvance';
import SlideshowHeader from './SlideshowHeader';
import SlideshowContent from './SlideshowContent';
import SlideshowNavigation from './SlideshowNavigation';
import SlideshowAudioPlayer from './SlideshowAudioPlayer';

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
  });

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen || segments.length === 0) return null;

  const currentSegment = segments[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-slate-900 story-slideshow-mobile"
      style={{
        background: `
          linear-gradient(rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)),
          url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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

      {fullStoryAudioUrl && (
        <SlideshowAudioPlayer fullStoryAudioUrl={fullStoryAudioUrl} />
      )}
    </div>
  );
};

export default StorySlideshow;

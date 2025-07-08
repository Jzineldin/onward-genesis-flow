
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorySegmentRow } from '@/types/stories';

interface SlideshowNavigationProps {
  segments: StorySegmentRow[];
  currentSlide: number;
  onClose: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
}

const SlideshowNavigation: React.FC<SlideshowNavigationProps> = ({
  segments,
  currentSlide,
  onClose,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
}) => {
  const handleClose = () => {
    console.log('🎬 Slideshow back button clicked - closing slideshow');
    onClose();
  };

  return (
    <div className="flex items-center justify-between p-2 md:p-4 bg-slate-800/95 border-t border-amber-500/30 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          onClick={handleClose}
          className="text-white hover:bg-amber-500/20 flex items-center gap-1 md:gap-2 border border-amber-500/30 mobile-friendly-button"
        >
          <X className="h-3 w-3 md:h-4 md:w-4" />
          <span className="text-xs md:text-sm">Back</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onPrevSlide}
          className="text-white hover:bg-amber-500/20 flex items-center gap-1 md:gap-2 border border-amber-500/30 mobile-friendly-button"
          disabled={segments.length <= 1}
        >
          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline text-xs md:text-sm">Previous</span>
        </Button>
      </div>

      {/* Slide indicators - Mobile optimized */}
      <div className="flex gap-1 max-w-xs sm:max-w-md overflow-x-auto bg-slate-700/50 px-2 md:px-3 py-1 md:py-2 rounded-full border border-amber-500/20">
        {segments.slice(0, 10).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoToSlide(index)}
            className={cn(
              "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 flex-shrink-0",
              index === currentSlide 
                ? "bg-amber-400 scale-125 shadow-lg shadow-amber-400/50" 
                : "bg-amber-200/30 hover:bg-amber-200/50"
            )}
          />
        ))}
        {segments.length > 10 && (
          <span className="text-amber-200/50 text-xs ml-1 md:ml-2">+{segments.length - 10}</span>
        )}
      </div>

      <Button
        variant="ghost"
        onClick={onNextSlide}
        className="text-white hover:bg-amber-500/20 flex items-center gap-1 md:gap-2 border border-amber-500/30 mobile-friendly-button"
        disabled={segments.length <= 1}
      >
        <span className="hidden sm:inline text-xs md:text-sm">Next</span>
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
      </Button>
    </div>
  );
};

export default SlideshowNavigation;

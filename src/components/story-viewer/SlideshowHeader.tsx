
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface SlideshowHeaderProps {
  currentSlide: number;
  totalSlides: number;
  isPlaying: boolean;
  onTogglePlayback: () => void;
}

const SlideshowHeader: React.FC<SlideshowHeaderProps> = ({
  currentSlide,
  totalSlides,
  isPlaying,
  onTogglePlayback,
}) => {
  return (
    <div className="flex items-center justify-between p-2 md:p-4 bg-slate-800/95 border-b border-amber-500/30 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePlayback}
          className="text-white hover:bg-amber-500/20 border border-amber-500/30 mobile-friendly-button"
        >
          {isPlaying ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />}
        </Button>
        <span className="text-amber-200 text-xs md:text-sm font-medium bg-slate-700/50 px-2 md:px-3 py-1 rounded-full border border-amber-500/30">
          Chapter {currentSlide + 1} of {totalSlides}
        </span>
        {isPlaying && (
          <span className="text-amber-400 text-xs animate-pulse bg-amber-900/30 px-1 md:px-2 py-1 rounded-full border border-amber-500/50 hidden sm:inline">
            ● PLAYING
          </span>
        )}
      </div>
    </div>
  );
};

export default SlideshowHeader;

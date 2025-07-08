
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';

interface SlideshowContentProps {
  currentSegment: StorySegmentRow;
  currentSlide: number;
}

const SlideshowContent: React.FC<SlideshowContentProps> = ({
  currentSegment,
  currentSlide,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="max-w-5xl w-full">
        <Card className="bg-slate-800/90 border-amber-500/30 shadow-2xl backdrop-blur-sm border-2">
          <CardContent className="card-content p-3 sm:p-6 md:p-8">
            {/* Image - Mobile responsive */}
            {currentSegment.image_url ? (
              <div className="mb-4 md:mb-6">
                <img
                  src={currentSegment.image_url}
                  alt={`Story chapter ${currentSlide + 1}`}
                  className="w-full max-h-60 sm:max-h-80 md:max-h-96 object-contain rounded-lg shadow-lg border border-amber-500/20"
                  onError={(e) => {
                    console.warn('Image failed to load:', currentSegment.image_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              // Placeholder for missing images - Mobile optimized
              <div className="mb-4 md:mb-6 bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-lg flex items-center justify-center h-48 sm:h-64 md:h-80 border border-amber-500/30">
                <div className="text-center text-amber-200">
                  <Eye className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-70 text-amber-400" />
                  <p className="text-sm font-medium">Chapter {currentSlide + 1}</p>
                  <p className="text-xs opacity-70">✨ Image materializing...</p>
                </div>
              </div>
            )}
            
            {/* Text - Mobile optimized */}
            <div className="text-slate-100 space-y-3 md:space-y-4">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed font-medium story-creation-text">
                {currentSegment.segment_text}
              </p>
              
              {/* Choice indicator if available */}
              {currentSegment.triggering_choice_text && (
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-amber-500/30">
                  <p className="text-xs md:text-sm text-amber-300 italic">
                    → Choice made: {currentSegment.triggering_choice_text}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SlideshowContent;

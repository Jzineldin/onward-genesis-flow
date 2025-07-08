
import React from 'react';
import AudioPlayer from '@/components/AudioPlayer';

interface SlideshowAudioPlayerProps {
  fullStoryAudioUrl: string;
}

const SlideshowAudioPlayer: React.FC<SlideshowAudioPlayerProps> = ({
  fullStoryAudioUrl,
}) => {
  return (
    <div className="p-2 md:p-4 bg-slate-800/95 border-t border-amber-500/30 backdrop-blur-sm shadow-lg">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-700/50 border border-amber-500/20 rounded-lg p-2 md:p-3">
          <AudioPlayer src={fullStoryAudioUrl} />
        </div>
      </div>
    </div>
  );
};

export default SlideshowAudioPlayer;

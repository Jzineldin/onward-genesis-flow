import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Mic } from 'lucide-react';
import { VoiceSelector, voices } from '@/components/VoiceSelector';
import AudioPlayer from '@/components/AudioPlayer';

interface VoiceGenerationSectionProps {
  hasAudio: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
  fullStoryAudioUrl?: string;
  onGenerateVoice: (voiceId: string) => void;
}

const VoiceGenerationSection: React.FC<VoiceGenerationSectionProps> = ({
  hasAudio,
  isGenerating,
  canGenerate,
  fullStoryAudioUrl,
  onGenerateVoice
}) => {
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);

  const handleGenerateVoice = () => {
    onGenerateVoice(selectedVoice);
  };

  return (
    <Card className="bg-slate-800/90 border-amber-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          {hasAudio ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <span className="h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center text-xs text-white">2</span>
          )}
          Voice Narration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasAudio ? (
          <div className="space-y-4">
            <p className="text-green-400 mb-4">🎵 Your story audio is ready!</p>
            <AudioPlayer src={fullStoryAudioUrl} />
          </div>
        ) : canGenerate ? (
          <div className="space-y-4">
            <p className="text-slate-400 mb-4">
              Add voice narration to bring your story to life
            </p>
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onVoiceChange={setSelectedVoice}
            />
            <Button 
              onClick={handleGenerateVoice}
              disabled={isGenerating}
              className="bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Voice...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Generate Voice Narration
                </>
              )}
            </Button>
          </div>
        ) : isGenerating ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-amber-500" />
            <p className="text-amber-300 font-medium">Creating your voice narration...</p>
            <p className="text-sm text-amber-400 mt-1">This may take a few minutes</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-red-400 mb-4">Voice generation failed. Please try again.</p>
            <Button 
              onClick={handleGenerateVoice}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceGenerationSection;

import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from 'lucide-react';
import { useTestVoice } from '@/hooks/useTestVoice';

export const voices = [
  { id: 'alloy', name: 'Alloy (Conversational)' },
  { id: 'echo', name: 'Echo (Dramatic)' },
  { id: 'fable', name: 'Fable (Storyteller)' },
  { id: 'onyx', name: 'Onyx (Deep & Serious)' },
  { id: 'nova', name: 'Nova (Energetic)' },
  { id: 'shimmer', name: 'Shimmer (Emotional)' },
];

export const VoiceSelector = ({ selectedVoice, onVoiceChange, disabled = false }: { selectedVoice: string, onVoiceChange: (voiceId: string) => void, disabled?: boolean }) => {
  const testVoiceMutation = useTestVoice();
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  const handleTestVoice = (voiceId: string) => {
    setTestingVoiceId(voiceId);
    testVoiceMutation.mutate({ voiceId }, {
        onSettled: () => {
            setTestingVoiceId(null);
        }
    });
  };

  return (
    <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">Narration Voice</span>
        <RadioGroup value={selectedVoice} onValueChange={onVoiceChange} className="gap-2" disabled={disabled}>
            {voices.map(voice => (
                <div key={voice.id} className="flex items-center justify-between p-2 pr-3 rounded-md border bg-background/90">
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value={voice.id} id={voice.id} />
                        <Label htmlFor={voice.id} className="cursor-pointer font-normal">{voice.name}</Label>
                    </div>
                    <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleTestVoice(voice.id)}
                        disabled={disabled || testingVoiceId === voice.id}
                        aria-label={`Test voice ${voice.name}`}
                        className="h-8 w-8"
                    >
                        {testingVoiceId === voice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            ))}
        </RadioGroup>
    </div>
  );
}

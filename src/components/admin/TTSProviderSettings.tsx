
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2 } from 'lucide-react';

interface TTSProviderSettings {
  primary: string;
  voice: string;
  speed: number;
}

interface TTSProviderSettingsProps {
  settings: TTSProviderSettings;
  onUpdate: (field: string, value: any) => void;
}

const TTSProviderSettings: React.FC<TTSProviderSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Text-to-Speech Providers
        </CardTitle>
        <CardDescription className="text-purple-200">
          Configure TTS settings and voice options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-white">Primary Provider</Label>
            <Select
              value={settings.primary}
              onValueChange={(value) => onUpdate('primary', value)}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI TTS</SelectItem>
                <SelectItem value="elevenlabs">ElevenLabs (Future)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Voice</Label>
            <Select
              value={settings.voice}
              onValueChange={(value) => onUpdate('voice', value)}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="fable">Fable (Storyteller)</SelectItem>
                <SelectItem value="onyx">Onyx</SelectItem>
                <SelectItem value="nova">Nova</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-white">Speech Speed</Label>
          <Input
            type="number"
            step="0.1"
            min="0.25"
            max="4.0"
            value={settings.speed}
            onChange={(e) => onUpdate('speed', parseFloat(e.target.value) || 1.0)}
            className="bg-slate-700 border-purple-600 text-white"
          />
          <p className="text-sm text-purple-200 mt-1">
            Speed range: 0.25x to 4.0x (1.0 = normal speed)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TTSProviderSettings;

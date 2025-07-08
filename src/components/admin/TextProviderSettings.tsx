
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2 } from 'lucide-react';

interface TextProviderSettings {
  primary: string;
  fallback: string;
  wordCount: { min: number; max: number };
  geminiSettings: {
    model: string;
    temperature: number;
  };
  openaiSettings: {
    model: string;
    temperature: number;
  };
}

interface TextProviderSettingsProps {
  settings: TextProviderSettings;
  onUpdate: (field: string, value: any) => void;
}

const TextProviderSettings: React.FC<TextProviderSettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Text Generation Providers
        </CardTitle>
        <CardDescription className="text-purple-200">
          Configure AI models for story generation
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
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Fallback Provider</Label>
            <Select
              value={settings.fallback}
              onValueChange={(value) => onUpdate('fallback', value)}
            >
              <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="mock">Mock Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-white">Min Word Count</Label>
            <Input
              type="number"
              value={settings.wordCount.min}
              onChange={(e) => onUpdate('wordCount', {
                ...settings.wordCount,
                min: parseInt(e.target.value) || 120
              })}
              className="bg-slate-700 border-purple-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Max Word Count</Label>
            <Input
              type="number"
              value={settings.wordCount.max}
              onChange={(e) => onUpdate('wordCount', {
                ...settings.wordCount,
                max: parseInt(e.target.value) || 200
              })}
              className="bg-slate-700 border-purple-600 text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Gemini Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Model</Label>
              <Select
                value={settings.geminiSettings.model}
                onValueChange={(value) => onUpdate('geminiSettings', {
                  ...settings.geminiSettings,
                  model: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash-latest">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro-latest">Gemini 1.5 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Temperature</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.geminiSettings.temperature}
                onChange={(e) => onUpdate('geminiSettings', {
                  ...settings.geminiSettings,
                  temperature: parseFloat(e.target.value) || 0.7
                })}
                className="bg-slate-700 border-purple-600 text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">OpenAI Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Model</Label>
              <Select
                value={settings.openaiSettings.model}
                onValueChange={(value) => onUpdate('openaiSettings', {
                  ...settings.openaiSettings,
                  model: value
                })}
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Temperature</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.openaiSettings.temperature}
                onChange={(e) => onUpdate('openaiSettings', {
                  ...settings.openaiSettings,
                  temperature: parseFloat(e.target.value) || 0.7
                })}
                className="bg-slate-700 border-purple-600 text-white"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextProviderSettings;

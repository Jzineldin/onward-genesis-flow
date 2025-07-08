
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Sparkles, DollarSign } from 'lucide-react';
import { CheckedState } from '@radix-ui/react-checkbox';

interface StorySetupScreenProps {
  prompt: string;
  storyMode: string;
  skipImage: boolean;
  apiCallsCount: number;
  onSkipImageChange: (checked: CheckedState) => void;
  onStartStory: () => void;
  onGoHome: () => void;
}

const StorySetupScreen: React.FC<StorySetupScreenProps> = ({
  prompt,
  storyMode,
  skipImage,
  apiCallsCount,
  onSkipImageChange,
  onStartStory,
  onGoHome
}) => {
  console.log('🖥️ StorySetupScreen: Rendering with props:', {
    prompt: prompt?.substring(0, 50) + '...',
    storyMode,
    skipImage,
    apiCallsCount
  });

  const canStartStory = prompt && prompt.trim().length > 0 && storyMode;

  const handleStartClick = () => {
    console.log('🔘 Generate Opening Scene button clicked!');
    console.log('📋 Button click details:', {
      canStartStory,
      prompt: prompt?.substring(0, 50) + '...',
      storyMode,
      skipImage
    });
    
    if (!canStartStory) {
      console.error('❌ Cannot start story - missing requirements');
      return;
    }
    
    console.log('✅ Calling onStartStory...');
    onStartStory();
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/90 border-purple-600 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl font-serif flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            Ready to Create Your Story
          </CardTitle>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="text-purple-300 border-purple-600">
              {storyMode}
            </Badge>
            <Badge variant="outline" className="text-green-300 border-green-600">
              <DollarSign className="h-3 w-3 mr-1" />
              {apiCallsCount} API calls used
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="text-purple-300 font-semibold mb-2">Your Story Prompt:</h3>
            <p className="text-white">{prompt}</p>
          </div>
          
          <div className="bg-amber-900/20 border border-amber-600/50 p-4 rounded-lg">
            <h4 className="text-amber-300 font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Control
            </h4>
            <p className="text-amber-200 text-sm mb-3">
              Each story segment costs API credits. You're in complete control of when generation happens.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-image"
                checked={skipImage}
                onCheckedChange={onSkipImageChange}
              />
              <label htmlFor="skip-image" className="text-sm text-amber-200 cursor-pointer">
                Skip image generation (saves 1-2 credits per segment)
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleStartClick}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
              disabled={!canStartStory}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Opening Scene
            </Button>
            
            {!canStartStory && (
              <p className="text-red-400 text-sm text-center">
                {!prompt ? 'No story prompt provided' : !storyMode ? 'No story mode selected' : 'Missing required information'}
              </p>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={onGoHome}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorySetupScreen;

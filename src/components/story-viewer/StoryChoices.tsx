
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flag } from 'lucide-react';

interface StoryChoicesProps {
  choices: string[];
  isEnd: boolean;
  onSelectChoice: (choice: string) => void;
  onFinishStory: () => void;
  onRestart: () => void;
  isLoading: boolean;
  isFinishingStory: boolean;
}

const StoryChoices: React.FC<StoryChoicesProps> = ({
  choices,
  isEnd,
  onSelectChoice,
  onFinishStory,
  onRestart,
  isLoading,
  isFinishingStory
}) => {
  if (isEnd) {
    return (
      <div className="space-y-4 w-full max-w-full">
        <div className="text-center">
          <p className="text-purple-300 text-xl font-serif mb-6">The End</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
            <Button
              onClick={onRestart}
              variant="outline"
              className="border-purple-600 text-purple-300 hover:bg-purple-700 w-full sm:w-auto"
            >
              Start New Story
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      <h3 className="text-purple-300 text-lg font-semibold mb-4">What happens next?</h3>
      <div className="space-y-3 w-full">
        {choices.map((choice, index) => (
          <Button
            key={index}
            onClick={() => onSelectChoice(choice)}
            disabled={isLoading}
            variant="outline"
            className="w-full text-left justify-start border-purple-600/50 text-white hover:bg-purple-700/50 hover:border-purple-500 transition-colors duration-200 min-h-fit py-3 px-4 whitespace-normal break-words hyphens-auto overflow-wrap-anywhere"
          >
            <div className="flex items-start gap-3 w-full">
              <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
              <span className="text-sm sm:text-base leading-relaxed break-words">{choice}</span>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="pt-4 border-t border-purple-600/30">
        <Button
          onClick={onFinishStory}
          disabled={isFinishingStory}
          variant="outline"
          className="w-full border-amber-600/50 text-amber-300 hover:bg-amber-700/20 hover:border-amber-500 transition-colors duration-200"
        >
          <Flag className="mr-2 h-4 w-4" />
          {isFinishingStory ? 'Finishing Story...' : 'End Story Here'}
        </Button>
      </div>
    </div>
  );
};

export default StoryChoices;

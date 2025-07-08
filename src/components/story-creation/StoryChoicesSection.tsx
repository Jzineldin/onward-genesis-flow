
import React from 'react';
import { Button } from '@/components/ui/button';

interface StoryChoicesSectionProps {
  choices: string[];
  isGenerating: boolean;
  onChoiceSelect: (choice: string) => void;
}

const StoryChoicesSection: React.FC<StoryChoicesSectionProps> = ({
  choices,
  isGenerating,
  onChoiceSelect
}) => {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="choices-section w-full space-y-4">
      <h3 className="text-amber-300 text-xl font-semibold text-center mb-6">
        What happens next?
      </h3>
      <div className="space-y-3">
        {choices.map((choice, index) => (
          <Button
            key={index}
            onClick={() => onChoiceSelect(choice)}
            disabled={isGenerating}
            variant="outline"
            className="w-full text-left justify-start border-amber-500/40 text-white hover:bg-amber-500/20 hover:border-amber-400 transition-all duration-300 min-h-fit py-4 px-6 text-base font-medium bg-slate-800/60 hover:shadow-lg hover:shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-amber-400 font-bold mr-4">{index + 1}.</span>
            <span className="leading-relaxed">{choice}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StoryChoicesSection;

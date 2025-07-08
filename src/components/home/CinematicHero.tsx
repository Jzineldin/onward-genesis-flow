
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeaderVisibility } from '@/context/HeaderVisibilityContext';

const CinematicHero: React.FC = () => {
  const navigate = useNavigate();
  const { showHeader } = useHeaderVisibility();

  const handleCreateAdventure = () => {
    showHeader();
    navigate('/adventure');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Transparent Container with mobile-optimized sizing */}
      <div className="backdrop-blur-sm bg-transparent rounded-2xl p-4 md:p-8 lg:p-12 border border-white/20 shadow-2xl w-full">
        {/* Tale Forge Title - Mobile responsive */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="tale-forge-title text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold font-serif text-white mb-4 md:mb-8 leading-tight"
              style={{
                textShadow: '0 0 30px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 0, 0, 0.7), 4px 4px 12px rgba(0, 0, 0, 0.95), -2px -2px 8px rgba(0, 0, 0, 0.8)'
              }}>
            Tale Forge
          </h1>
          
          {/* Simple Tagline - Mobile responsive */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-4xl text-white max-w-4xl mx-auto leading-relaxed mb-6 md:mb-8 px-2"
             style={{
               textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 0, 0, 0.7), 3px 3px 8px rgba(0, 0, 0, 0.95), -1px -1px 6px rgba(0, 0, 0, 0.8)'
             }}>
            Where imagination meets
            <span className="font-cursive text-amber-300 mx-2" style={{fontStyle: 'italic'}}>
              infinite possibilities
            </span>
          </p>
        </div>

        {/* Mobile-optimized CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
          <Button
            onClick={handleCreateAdventure}
            className="group px-6 md:px-8 py-3 md:py-4 text-base md:text-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg mobile-friendly-button"
          >
            <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
            Create your own AI powered story
          </Button>
          
          <Button
            onClick={handleLearnMore}
            variant="outline"
            className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg text-white border-white/30 bg-black/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Info className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            What is Tale Forge?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CinematicHero;

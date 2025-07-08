import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/stories';
import { MagicalStoryCard } from '@/components/my-stories/MagicalStoryCard';
import { Globe, BookOpen } from 'lucide-react';

const fetchPublicStories = async () => {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, created_at, published_at, is_public, is_completed, thumbnail_url, segment_count, story_mode, full_story_audio_url, audio_generation_status, shotstack_status, shotstack_video_url')
    .eq('is_public', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as Story[];
};

const PublicStories = () => {
  const { data: stories, isLoading, error } = useQuery({
    queryKey: ['public-stories'],
    queryFn: fetchPublicStories
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cozy library background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Leonardo_Phoenix_10_A_cozy_wooden_library_at_night_with_floati_2.jpg')"
        }}
      />
      
      {/* Light overlay for readability */}
      <div className="fixed inset-0 library-background-overlay" />

      {/* Enhanced ambient magical particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/6 left-1/5 w-2 h-2 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50 ambient-particle-1"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50 ambient-particle-2"></div>
        <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50 ambient-particle-3"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Enhanced Library Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-6 mb-6">
            <div className="p-4 bg-gradient-to-br from-amber-900/40 to-amber-700/30 border-2 border-amber-400/40 rounded-xl backdrop-blur-sm shadow-xl">
              <Globe className="h-10 w-10 text-amber-200" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-amber-100 tracking-wide drop-shadow-2xl"
                  style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                Public Library
              </h1>
              <p className="text-amber-300/90 text-xl mt-2 font-serif">
                Discover magical tales shared by fellow storytellers
              </p>
            </div>
          </div>
          
          {/* Enhanced library stats */}
          <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur-sm border border-amber-400/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-8 text-amber-300/80 text-base">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>{stories?.length || 0} public stories available</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-400/30 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              <div className="p-8 bg-gradient-to-br from-red-900/30 to-red-800/20 border-2 border-red-400/30 rounded-3xl backdrop-blur-sm mb-8 shadow-2xl">
                <p className="text-red-300 text-lg">Error loading stories: {error.message}</p>
              </div>
            </div>
          </div>
        )}

        {stories && stories.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              <div className="p-8 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-2 border-amber-400/30 rounded-3xl backdrop-blur-sm mb-8 shadow-2xl">
                <BookOpen className="h-20 w-20 text-amber-300/60 mx-auto mb-6" />
                <h3 className="text-3xl font-semibold text-amber-200 mb-4 font-serif">
                  No Public Stories Yet
                </h3>
                <p className="text-amber-300/80 text-lg leading-relaxed">
                  Be the first to share your magical tale with the world! Complete a story and publish it to the public library.
                </p>
              </div>
            </div>
          </div>
        )}

        {stories && stories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={`book-entrance-animation opacity-0 book-entrance-delay-${Math.min((index % 6) + 1, 6)}`}
              >
                <MagicalStoryCard
                  story={story}
                  onSetStoryToDelete={() => {}} // Public stories can't be deleted by viewers
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStories;
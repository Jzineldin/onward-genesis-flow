import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/stories';
import { MagicalStoryCard } from '@/components/my-stories/MagicalStoryCard';
import { Globe, BookOpen, Sparkles, Star, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fetchPublicStories = async () => {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, created_at, published_at, is_public, is_completed, thumbnail_url, segment_count, story_mode, full_story_audio_url, audio_generation_status, shotstack_status, shotstack_video_url, user_id')
    .eq('is_public', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const PublicStories = () => {
  const { data: stories, isLoading, error, refetch } = useQuery({
    queryKey: ['public-stories'],
    queryFn: fetchPublicStories
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced magical background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Leonardo_Phoenix_10_A_cozy_wooden_library_at_night_with_floati_2.jpg')"
        }}
      />
      
      {/* Improved overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70" />

      {/* Enhanced magical particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/6 left-1/5 w-2 h-2 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50 animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-3/4 left-1/6 w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-lg shadow-emerald-300/50 animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/8 right-1/5 w-2 h-2 bg-rose-300 rounded-full shadow-lg shadow-rose-300/50 animate-pulse" style={{ animationDelay: '5s' }}></div>
        
        {/* Floating book pages */}
        <div className="absolute top-1/3 left-1/8 w-4 h-6 bg-amber-100/10 rounded-sm transform rotate-12 animate-pulse" style={{ animationDelay: '6s' }}></div>
        <div className="absolute top-2/5 right-1/8 w-3 h-5 bg-amber-100/8 rounded-sm transform -rotate-6 animate-pulse" style={{ animationDelay: '7s' }}></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Enhanced header */}
        <div className="mb-12">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 border-amber-500/40 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-amber-900/50 to-amber-700/40 border-2 border-amber-400/50 rounded-xl backdrop-blur-sm shadow-xl">
                  <Globe className="h-12 w-12 text-amber-200" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl font-bold text-amber-100 tracking-wide drop-shadow-2xl"
                      style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                    Public Library
                  </h1>
                  <p className="text-amber-300/90 text-xl mt-2 font-serif">
                    Discover magical tales shared by fellow storytellers
                  </p>
                </div>
              </div>
              
              <div className="h-1 w-48 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto rounded-full shadow-lg shadow-amber-500/30"></div>
            </CardHeader>
          </Card>
          
          {/* Enhanced stats and controls */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Card className="bg-gradient-to-r from-slate-900/70 to-slate-800/50 backdrop-blur-sm border border-amber-400/30 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-6 text-amber-300/90 text-base">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-amber-400" />
                    <span>{stories?.length || 0} public stories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-amber-400" />
                    <span>Community tales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-amber-400" />
                    <span>Shared adventures</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="bg-amber-900/40 border-amber-500/50 text-amber-200 hover:bg-amber-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Library
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-400/30 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <Card className="max-w-lg mx-auto bg-gradient-to-br from-red-900/40 to-red-800/30 border-2 border-red-400/40 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-8">
                <div className="text-red-300 text-lg mb-4">
                  Error loading stories: {error.message}
                </div>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {stories && stories.length === 0 && (
          <div className="text-center py-20">
            <Card className="max-w-lg mx-auto bg-gradient-to-br from-amber-900/40 to-amber-800/30 border-2 border-amber-400/40 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-8">
                <BookOpen className="h-20 w-20 text-amber-300/60 mx-auto mb-6" />
                <h3 className="text-3xl font-semibold text-amber-200 mb-4 font-serif">
                  No Public Stories Yet
                </h3>
                <p className="text-amber-300/80 text-lg leading-relaxed mb-6">
                  Be the first to share your magical tale with the world! Complete a story and publish it to the public library.
                </p>
                <div className="flex items-center justify-center space-x-2 text-amber-400/70">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm">Stories will appear here once published by community members</span>
                  <Sparkles className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stories grid */}
        {stories && stories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={`book-entrance-animation opacity-0 book-entrance-delay-${Math.min((index % 6) + 1, 6)} transform hover:scale-105 transition-all duration-300`}
              >
                <MagicalStoryCard
                  story={story}
                  onSetStoryToDelete={() => {}} // Public stories can't be deleted by viewers
                  isPublicLibrary={true}
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
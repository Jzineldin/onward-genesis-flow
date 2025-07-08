
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, MessageCircle, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PublicStory {
  id: string;
  title: string;
  description: string;
  story_mode: string;
  created_at: string;
  segment_count: number;
  like_count: number;
  comment_count: number;
  author_name: string;
}

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const { data: stories, isLoading } = useQuery({
    queryKey: ['public-stories', searchTerm, selectedGenre],
    queryFn: async () => {
      let query = supabase
        .from('stories')
        .select(`
          id,
          title,
          description,
          story_mode,
          created_at,
          segment_count,
          profiles!inner(full_name)
        `)
        .eq('is_public', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedGenre) {
        query = query.eq('story_mode', selectedGenre);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(story => ({
        ...story,
        author_name: (story.profiles as any)?.full_name || 'Anonymous',
        like_count: 0, // Will be populated by separate query
        comment_count: 0 // Will be populated by separate query
      })) as PublicStory[];
    }
  });

  const genres = [
    'child-adapted',
    'horror-story',
    'educational',
    'epic-fantasy',
    'sci-fi-thriller',
    'mystery',
    'romantic-drama',
    'adventure-quest'
  ];

  const getGenreEmoji = (genre: string) => {
    const emojiMap: { [key: string]: string } = {
      'child-adapted': '👶',
      'horror-story': '👻',
      'educational': '📚',
      'epic-fantasy': '🏰',
      'sci-fi-thriller': '🚀',
      'mystery': '🕵️',
      'romantic-drama': '💕',
      'adventure-quest': '🗺️'
    };
    return emojiMap[genre] || '📖';
  };

  return (
    <div 
      className="min-h-screen bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-serif">
            Discover <span className="text-amber-400">Stories</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore incredible interactive stories created by our community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/90 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedGenre === '' ? 'default' : 'outline'}
              onClick={() => setSelectedGenre('')}
              className={selectedGenre === '' ? 'bg-amber-500 hover:bg-amber-600' : 'border-slate-600 text-gray-300 hover:bg-slate-700'}
            >
              All Genres
            </Button>
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                onClick={() => setSelectedGenre(genre)}
                className={selectedGenre === genre 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                }
              >
                {getGenreEmoji(genre)} {genre.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/90 border-slate-600 backdrop-blur-sm animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-600 rounded mb-2"></div>
                  <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-4 bg-slate-600 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stories && stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card 
                key={story.id}
                className="bg-slate-800/90 border-slate-600 backdrop-blur-sm hover:border-amber-400/60 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/story-viewer/${story.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getGenreEmoji(story.story_mode)}</span>
                      <div>
                        <CardTitle className="text-white text-lg font-serif group-hover:text-amber-400 transition-colors">
                          {story.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {story.story_mode.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <User className="h-3 w-3" />
                    <span>{story.author_name}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {story.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {story.like_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {story.comment_count}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(story.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 text-amber-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Stories Found</h3>
              <p className="text-gray-300 mb-6">
                {searchTerm || selectedGenre 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to publish a public story!"
                }
              </p>
              <Button
                onClick={() => navigate('/create/genre')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Create Story
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Discover;

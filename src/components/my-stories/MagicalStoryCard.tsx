
import React, { useState } from 'react';
import { Story } from '@/types/stories';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle, Clock, MoreHorizontal, Trash2, Eye, Bookmark, Share2, Volume2 } from 'lucide-react';
import { usePublishStory } from '@/hooks/usePublishStory';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MagicalStoryCardProps {
  story: Story;
  onSetStoryToDelete: (storyId: string) => void;
}

export const MagicalStoryCard: React.FC<MagicalStoryCardProps> = ({ story, onSetStoryToDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { mutate: publishStory, isPending: isPublishing } = usePublishStory();

  const getStoryModeColor = (storyMode: string) => {
    const colorMap: { [key: string]: string } = {
      'Epic Fantasy': 'from-purple-900/40 to-indigo-900/30',
      'Sci-Fi Thriller': 'from-cyan-900/40 to-blue-900/30',
      'Mystery Detective': 'from-gray-900/40 to-slate-900/30',
      'Horror Story': 'from-red-900/40 to-black/30',
      'Adventure Quest': 'from-green-900/40 to-emerald-900/30',
      'Romantic Drama': 'from-rose-900/40 to-pink-900/30',
      'Comedy Adventure': 'from-yellow-900/40 to-orange-900/30',
      'Historical Journey': 'from-amber-900/40 to-yellow-900/30',
      'Child-Adapted Story': 'from-teal-900/40 to-cyan-900/30',
      'Educational Adventure': 'from-indigo-900/40 to-purple-900/30',
    };
    return colorMap[storyMode || 'Epic Fantasy'] || 'from-purple-900/40 to-indigo-900/30';
  };

  return (
    <div 
      className={`magical-book-card group relative ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced book spine with more realistic styling */}
      <div className="absolute -left-3 top-3 bottom-3 w-8 enhanced-book-spine rounded-l-lg transform -skew-y-1 shadow-xl">
        {/* Spine decorative elements */}
        <div className="absolute top-4 left-1 right-1 h-0.5 bg-amber-400/30 rounded-full"></div>
        <div className="absolute bottom-4 left-1 right-1 h-0.5 bg-amber-400/30 rounded-full"></div>
        <div className="absolute top-1/2 left-1 right-1 h-px bg-amber-500/40 rounded-full transform -translate-y-1/2"></div>
      </div>
      
      {/* Main book cover with old book styling */}
      <div className={`relative h-72 w-full rounded-xl bg-gradient-to-br ${getStoryModeColor(story.story_mode || 'Epic Fantasy')} old-book-texture ornate-gold-border shadow-2xl overflow-hidden`}>
        
        {/* Aged paper overlay with more texture */}
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: `
                 radial-gradient(circle at 25% 75%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
                 radial-gradient(circle at 75% 25%, rgba(160, 82, 45, 0.2) 0%, transparent 50%),
                 linear-gradient(45deg, rgba(101, 67, 33, 0.1) 0%, transparent 100%)
               `
             }}>
        </div>
        
        {/* Enhanced decorative corner flourishes */}
        <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg">
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-amber-400/40 rounded-full"></div>
        </div>
        <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-amber-400/60 rounded-tr-lg">
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400/40 rounded-full"></div>
        </div>
        <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-amber-400/60 rounded-bl-lg">
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-400/40 rounded-full"></div>
        </div>
        <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg">
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-amber-400/40 rounded-full"></div>
        </div>
        
        {/* Story mode badge with enhanced styling */}
        <div className="absolute top-4 left-4 px-3 py-1.5 story-mode-badge rounded-lg shadow-lg">
          <span className="text-amber-100 text-xs font-medium tracking-wide">{story.story_mode}</span>
        </div>
        
        {/* Status indicator with bookmark design */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="p-2 bg-black/50 border border-amber-400/40 rounded-full backdrop-blur-sm shadow-lg">
            {story.is_completed ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <Clock className="h-4 w-4 text-amber-400" />
            )}
          </div>
          <Bookmark className="h-5 w-5 text-amber-400/60 fill-current" />
        </div>
        
        {/* Story content area with better typography */}
        <div className="absolute inset-x-6 bottom-6 top-20">
          <div className="h-full flex flex-col justify-between">
            {/* Title area with serif font */}
            <div className="flex-1 flex items-center justify-center p-4">
              <h3 className="book-title-serif text-amber-50 text-xl font-semibold text-center leading-tight line-clamp-3">
                {story.title || 'Untitled Story'}
              </h3>
            </div>
            
            {/* Enhanced metadata */}
            <div className="text-center space-y-2 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-amber-400/20">
              <p className="text-amber-200/90 text-sm font-medium">
                Created {format(new Date(story.created_at), 'MMM d, yyyy')}
              </p>
              {story.segment_count && (
                <p className="text-amber-300/80 text-xs">
                  {story.segment_count} {story.segment_count === 1 ? 'chapter' : 'chapters'}
                </p>
              )}
              <div className="flex justify-center items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${story.is_completed ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                <span className="text-amber-300/70">
                  {story.is_completed ? 'Complete' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced hover overlay with magical effects */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center space-x-2`}>
          <Link to={`/story/${story.id}`}>
            <Button variant="outline" size="sm" className="bg-amber-900/90 border-amber-400/70 text-amber-100 hover:bg-amber-800/95 shadow-xl">
              <Eye className="h-4 w-4 mr-2" />
              Read
            </Button>
          </Link>
          
          {story.is_completed && !story.full_story_audio_url && (
            <Button variant="outline" size="sm" className="bg-emerald-900/90 border-emerald-400/70 text-emerald-100 hover:bg-emerald-800/95 shadow-xl">
              <Volume2 className="h-4 w-4 mr-2" />
              Voice
            </Button>
          )}
          
          {story.is_completed && !story.is_public && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => publishStory(story.id)}
              disabled={isPublishing}
              className="bg-blue-900/90 border-blue-400/70 text-blue-100 hover:bg-blue-800/95 shadow-xl"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-amber-900/90 border-amber-400/70 text-amber-100 hover:bg-amber-800/95 shadow-xl">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900/95 border-amber-400/40 backdrop-blur-sm shadow-2xl">
              <DropdownMenuItem asChild>
                <Link to={`/story/${story.id}`} className="w-full cursor-pointer text-amber-100 hover:bg-amber-900/50">
                  <Eye className="mr-2 h-4 w-4" />
                  View Story
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  onSetStoryToDelete(story.id);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/40 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Enhanced book shadow with multiple layers */}
      <div className="absolute inset-0 -z-10 bg-black/30 transform translate-x-2 translate-y-2 rounded-xl blur-md group-hover:translate-x-3 group-hover:translate-y-3 group-hover:blur-lg transition-all duration-400"></div>
      <div className="absolute inset-0 -z-20 bg-black/15 transform translate-x-4 translate-y-4 rounded-xl blur-lg group-hover:translate-x-5 group-hover:translate-y-5 transition-all duration-400"></div>
    </div>
  );
};

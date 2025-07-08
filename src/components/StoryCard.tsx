
import React, { useState } from 'react';
import { Story } from '@/types/stories';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle, Hourglass, ImageIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface StoryCardProps {
  story: Story;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Story card image loaded: ${story.story_mode}`);
    setImageLoaded(true);
    e.currentTarget.setAttribute('data-loaded', 'true');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Failed to load story image: ${e.currentTarget.src}`);
    setImageError(true);
    setImageLoaded(true);
  };

  // Map story mode to image filename with static paths - using exact file names
  const getStoryModeImage = (storyMode: string) => {
    const imageMap: { [key: string]: string } = {
      'Epic Fantasy': '/images/Epic Fantasy.png',
      'Sci-Fi Thriller': '/images/Sci-Fi Thriller.png',
      'Mystery Detective': '/images/Mystery Detective.png',
      'Horror Story': '/images/Horror Story.png',
      'Adventure Quest': '/images/Adventure Quest.png',
      'Romantic Drama': '/images/Romantic Drama.png',
      'Comedy Adventure': '/images/Comedy Adventure.png',
      'Historical Journey': '/images/Historical Journey.png',
      'Child-Adapted Story': '/images/Child-Adapted Story.png',
      'Educational Adventure': '/images/Educational Adventure.png',
    };
    
    return imageMap[storyMode] || story.thumbnail_url || '/placeholder.svg';
  };

  return (
    <Link to={`/story/${story.id}`} className="block h-full">
      <div className="story-card-landscape">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <Skeleton className="w-full h-full absolute inset-0 z-0" />
        )}
        
        {/* Error state */}
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 absolute inset-0">
            <div className="text-center text-white/60">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        ) : (
          <img 
            src={getStoryModeImage(story.story_mode || 'Epic Fantasy')}
            alt={story.title || 'Story thumbnail'} 
            className={`w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-600 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Status badge */}
        <div className="badge">
          {story.is_completed ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <Hourglass className="h-4 w-4 text-yellow-400" />
          )}
        </div>

        {/* Title and date overlay with gradient background */}
        <div className="content">
          <h3>{story.title || 'Untitled Story'}</h3>
          <p className="line-clamp-2">{format(new Date(story.published_at || story.created_at), 'MMM d, yyyy')}</p>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;

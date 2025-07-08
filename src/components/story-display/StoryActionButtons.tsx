
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, PlusCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface StoryActionButtonsProps {
  storyId: string;
  storyTitle: string;
  onShare?: () => void;
  onDownload?: () => void;
}

const StoryActionButtons: React.FC<StoryActionButtonsProps> = ({
  storyId,
  storyTitle,
  onShare,
  onDownload
}) => {
  const navigate = useNavigate();

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      const shareUrl = `${window.location.origin}/story/${storyId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Story link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      toast.info('Download feature coming soon!');
    }
  };

  const createNewStory = () => {
    navigate('/create/genre');
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-amber-500/20">
      <Button
        onClick={handleShare}
        variant="outline"
        className="border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Story
      </Button>

      <Button
        onClick={handleDownload}
        variant="outline"
        className="border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>

      <Button
        onClick={createNewStory}
        className="bg-amber-500 hover:bg-amber-600 text-slate-900"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Story
      </Button>

      <Button
        onClick={goHome}
        variant="outline"
        className="border-gray-600 text-gray-300 hover:bg-gray-600/20"
      >
        <Home className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
};

export default StoryActionButtons;

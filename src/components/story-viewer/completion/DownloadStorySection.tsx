import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileDown, FileImage, Share2 } from 'lucide-react';
import { StoryExporter } from '@/utils/storyExporter';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DownloadStorySectionProps {
  storyId: string;
  storyTitle: string;
}

const DownloadStorySection: React.FC<DownloadStorySectionProps> = ({
  storyId,
  storyTitle
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (format: 'text' | 'html' | 'json' | 'images') => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'text':
          await StoryExporter.exportAsText(storyId, storyTitle);
          toast.success('Story exported as text file!');
          break;
        case 'html':
          await StoryExporter.exportAsHTML(storyId, storyTitle);
          toast.success('Story exported as HTML file!');
          break;
        case 'json':
          await StoryExporter.exportAsJSON(storyId, storyTitle);
          toast.success('Story exported as JSON file!');
          break;
        case 'images':
          await StoryExporter.downloadImages(storyId, storyTitle);
          toast.success('Story images downloaded!');
          break;
        default:
          toast.error('Unknown export format');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export story. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [storyId, storyTitle]);

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/story/${storyId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Story link copied to clipboard!');
  }, [storyId]);

  return (
    <Card className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border-emerald-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-emerald-200 flex items-center gap-2">
          <span className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">3</span>
          Save & Share Your Story
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-emerald-300 mb-6">
          Keep your story forever! Download it in multiple formats or share it with friends.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Download Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="bg-emerald-600/90 hover:bg-emerald-600 border-2 border-emerald-400 hover:border-emerald-300 text-white px-6 py-3 font-semibold flex-1"
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Download className="mr-2 h-5 w-5" />
                )}
                {isExporting ? 'Exporting...' : '💾 Download Story'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 bg-slate-800 border-emerald-500/30">
              <DropdownMenuItem 
                onClick={() => handleExport('text')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileText className="mr-2 h-4 w-4" />
                Text File (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('html')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileDown className="mr-2 h-4 w-4" />
                HTML File (.html)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('json')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileText className="mr-2 h-4 w-4" />
                JSON Data (.json)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-emerald-500/30" />
              <DropdownMenuItem 
                onClick={() => handleExport('images')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileImage className="mr-2 h-4 w-4" />
                Download Images
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="bg-cyan-600/90 hover:bg-cyan-600 border-2 border-cyan-400 hover:border-cyan-300 text-white px-6 py-3 font-semibold flex-1"
          >
            <Share2 className="mr-2 h-5 w-5" />
            🔗 Share Link
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-emerald-400 text-sm">
            ✨ Export includes all chapters, images, and formatting
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadStorySection;

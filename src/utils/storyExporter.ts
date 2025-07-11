import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/stories';

interface StorySegment {
  id: string;
  segment_text: string;
  image_url: string | null;
  audio_url: string | null;
  triggering_choice_text: string | null;
  created_at: string;
}

interface StoryExportData {
  story: Story;
  segments: StorySegment[];
  metadata: {
    exportDate: string;
    totalWords: number;
    totalSegments: number;
    hasAudio: boolean;
    hasImages: boolean;
    storyMode: string;
  };
}

export class StoryExporter {
  static async fetchStoryData(storyId: string): Promise<StoryExportData> {
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title, created_at, is_public, is_completed, story_mode, thumbnail_url, segment_count, published_at, full_story_audio_url, audio_generation_status, shotstack_render_id, shotstack_video_url, shotstack_status')
      .eq('id', storyId)
      .single();

    if (storyError) {
      throw new Error(`Failed to fetch story: ${storyError.message}`);
    }

    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('id, segment_text, image_url, audio_url, triggering_choice_text, created_at')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (segmentsError) {
      throw new Error(`Failed to fetch story segments: ${segmentsError.message}`);
    }

    const totalWords = segments.reduce((total, segment) => {
      return total + (segment.segment_text?.split(' ').length || 0);
    }, 0);

    const hasAudio = segments.some(segment => segment.audio_url) || !!story.full_story_audio_url;
    const hasImages = segments.some(segment => segment.image_url && segment.image_url !== '/placeholder.svg');

    return {
      story: story as Story,
      segments,
      metadata: {
        exportDate: new Date().toISOString(),
        totalWords,
        totalSegments: segments.length,
        hasAudio,
        hasImages,
        storyMode: story.story_mode || 'Unknown'
      }
    };
  }

  static downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static downloadHTMLFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportAsText(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    
    let content = `# ${data.story.title || 'Untitled Story'}\n\n`;
    content += `**Story Mode:** ${data.metadata.storyMode}\n`;
    content += `**Created:** ${new Date(data.story.created_at).toLocaleDateString()}\n`;
    content += `**Total Words:** ${data.metadata.totalWords}\n`;
    content += `**Total Segments:** ${data.metadata.totalSegments}\n`;
    content += `**Exported:** ${new Date(data.metadata.exportDate).toLocaleString()}\n\n`;
    content += `---\n\n`;

    data.segments.forEach((segment, index) => {
      content += `## Chapter ${index + 1}\n\n`;
      if (segment.triggering_choice_text) {
        content += `*Choice: "${segment.triggering_choice_text}"*\n\n`;
      }
      content += `${segment.segment_text}\n\n`;
      if (segment.image_url && segment.image_url !== '/placeholder.svg') {
        content += `*[Image available: ${segment.image_url}]*\n\n`;
      }
      if (segment.audio_url) {
        content += `*[Audio available: ${segment.audio_url}]*\n\n`;
      }
      content += `---\n\n`;
    });

    if (data.story.full_story_audio_url) {
      content += `## 🎵 Complete Story Audio\n\n`;
      content += `*[Full story audio: ${data.story.full_story_audio_url}]*\n\n`;
    }

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    this.downloadTextFile(content, filename);
  }

  static async exportAsHTML(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.story.title || 'Untitled Story'}</title>
    <style>
        body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; background-color: #f9f7f4; color: #333; }
        .header { border-bottom: 2px solid #8B4513; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
        .title { font-size: 2.5em; color: #8B4513; margin-bottom: 10px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        .metadata { background: #f0eee8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #D4AF37; }
        .chapter { margin-bottom: 40px; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .chapter h2 { color: #8B4513; border-bottom: 1px solid #D4AF37; padding-bottom: 10px; }
        .choice { font-style: italic; color: #666; background: #f8f6f0; padding: 10px; border-left: 3px solid #D4AF37; margin-bottom: 15px; }
        .story-text { font-size: 1.1em; line-height: 1.8; text-align: justify; }
        .media-content { margin: 20px 0; text-align: center; }
        .media-content img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .full-story-audio { background: #e8f4f8; padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center; border: 2px solid #5bc0de; }
        audio { width: 100%; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${data.story.title || 'Untitled Story'}</h1>
        <div class="metadata">
            <p><strong>Story Mode:</strong> ${data.metadata.storyMode}</p>
            <p><strong>Created:</strong> ${new Date(data.story.created_at).toLocaleDateString()}</p>
            <p><strong>Total Words:</strong> ${data.metadata.totalWords}</p>
            <p><strong>Total Segments:</strong> ${data.metadata.totalSegments}</p>
            <p><strong>Exported:</strong> ${new Date(data.metadata.exportDate).toLocaleString()}</p>
        </div>
    </div>`;

    if (data.story.full_story_audio_url) {
      html += `<div class="full-story-audio">
            <h3>🎵 Complete Story Audio</h3>
            <audio controls src="${data.story.full_story_audio_url}">
                Your browser does not support the audio element.
            </audio>
        </div>`;
    }

    data.segments.forEach((segment, index) => {
      html += `<div class="chapter">
            <h2>Chapter ${index + 1}</h2>`;
      
      if (segment.triggering_choice_text) {
        html += `<div class="choice">Choice: "${segment.triggering_choice_text}"</div>`;
      }
      
      html += `<div class="story-text">${segment.segment_text.replace(/\n/g, '<br>')}</div>`;
      
      if (segment.image_url && segment.image_url !== '/placeholder.svg') {
        html += `<div class="media-content">
                <img src="${segment.image_url}" alt="Chapter ${index + 1} illustration" loading="lazy" />
            </div>`;
      }
      
      if (segment.audio_url) {
        html += `<div class="media-content">
                <audio controls src="${segment.audio_url}">
                    Your browser does not support the audio element.
                </audio>
            </div>`;
      }
      
      html += `</div>`;
    });

    html += `</div></body></html>`;

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    this.downloadHTMLFile(html, filename);
  }

  static async exportAsJSON(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    const jsonContent = JSON.stringify(data, null, 2);
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.json`;
    this.downloadTextFile(jsonContent, filename);
  }

  static async downloadImages(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    const images = data.segments.filter(s => s.image_url && s.image_url !== '/placeholder.svg');
    
    if (images.length === 0) {
      alert('No images found in this story to download.');
      return;
    }

    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${data.story.title} - Images</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .image-container { margin-bottom: 30px; text-align: center; }
        img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px; }
        h3 { margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>${data.story.title} - All Images</h1>
    <p>Right-click on any image and select "Save image as..." to download.</p>`;

    images.forEach((segment, index) => {
      html += `<div class="image-container">
        <h3>Chapter ${data.segments.indexOf(segment) + 1}</h3>
        <img src="${segment.image_url}" alt="Chapter ${data.segments.indexOf(segment) + 1}" />
    </div>`;
    });

    html += `</body></html>`;

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_images.html`;
    this.downloadHTMLFile(html, filename);
  }
}

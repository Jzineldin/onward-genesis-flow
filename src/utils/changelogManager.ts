interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

class ChangelogManager {
  private static readonly STORAGE_KEY = 'taleforge-changelog';
  
  // Get current changelog from localStorage or return default
  static getCurrentChangelog(): ChangelogEntry[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored changelog:', error);
      }
    }
    
    // Return updated default changelog with latest improvements
    return [
      {
        version: '2.6.0',
        date: '2025-07-04',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Streamlined User Interface (UI) - drastically reduced text density and information overload on the landing page' },
          { type: 'improvement', description: 'Transitioned from "game-like" feel to a more professional, product-focused design addressing UI overwhelm feedback' },
          { type: 'improvement', description: 'Enhanced AI Core with refined subject adherence, ensuring better focus on intended narrative and context' },
          { type: 'feature', description: 'Alternative Sub-Page for Education - dedicated page designed for serious learning experience' },
          { type: 'feature', description: 'Educational content prioritization over adventure and storytelling for educators and parents' },
          { type: 'improvement', description: 'Comprehensive Rebuild - systematic platform rebuild ensuring robust and scalable foundation' },
          { type: 'improvement', description: 'Long-term stability approach avoiding temporary patches for sustainable growth' },
          { type: 'improvement', description: 'Improved Accessibility & Content Safety measures, particularly for younger users and classroom environments' },
          { type: 'feature', description: 'Pre-made Story Examples and tutorials to help new users get started with clear prompting guidance' },
          { type: 'feature', description: 'UI Theming Options including lighter themes to broaden appeal beyond gaming aesthetic' },
          { type: 'improvement', description: 'Differentiated "Choose Your Own Adventure" emphasis as unique selling proposition' },
          { type: 'improvement', description: 'Optimized Story Pacing with A/B testing exploration for engagement and retention sweet spot' },
          { type: 'improvement', description: 'Maintained positive design elements - retained highly praised UI/UX design and visually appealing login page' },
        ],
      },
      {
        version: '2.5.0',
        date: '2025-06-30',
        type: 'minor',
        changes: [
          { type: 'fix', description: 'MAJOR AI Integration Fix - Resolved "Edge Function returned a non-2xx status code" errors that were preventing story generation' },
          { type: 'improvement', description: 'Upgraded to OpenAI GPT-4.1-2025-04-14 for superior story generation with enhanced creativity and coherence' },
          { type: 'improvement', description: 'Implemented robust fallback system - Google Gemini serves as backup when OpenAI is unavailable' },
          { type: 'improvement', description: 'Enhanced story creation UI with astronaut background consistency and improved vertical layout (Image → Text → Choices)' },
          { type: 'fix', description: 'Fixed image generation using GPT-Image-1 model for better visual storytelling integration' },
          { type: 'improvement', description: 'Added comprehensive error handling and logging throughout the AI generation pipeline for better reliability' },
          { type: 'improvement', description: 'Enhanced API response structure with proper success/error status handling for more stable user experience' },
          { type: 'fix', description: 'Resolved TypeError issues in edge functions that were causing generation failures' },
          { type: 'improvement', description: 'Improved story prompt engineering for more engaging narratives with 150-250 word segments' },
          { type: 'feature', description: 'Added multi-provider AI system with automatic failover capabilities for maximum uptime' },
        ],
      },
      {
        version: '2.4.0',
        date: '2025-06-29',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Major refactoring of story display components - broke down large StorySegmentItem into focused components (StoryContent, StoryImageDisplay, etc.)' },
          { type: 'improvement', description: 'Enhanced image display system with clearer loading states and better error handling for story images' },
          { type: 'improvement', description: 'Simplified image URL validation logic and removed potentially interfering accessibility tests' },
          { type: 'improvement', description: 'Added comprehensive debug logging for image generation status tracking and troubleshooting' },
          { type: 'fix', description: 'Fixed navigation conflicts in header - removed conflicting onClick handlers from TaleForge logo for consistent routing' },
          { type: 'fix', description: 'Resolved issues where HOME and TaleForge logo buttons were not properly navigating to landing page' },
          { type: 'fix', description: 'Improved component organization by creating smaller, more maintainable story viewer components' },
          { type: 'improvement', description: 'Enhanced story image loading with better fallback states and user feedback during generation' },
        ],
      },
      {
        version: '2.3.0',
        date: '2025-01-28',
        type: 'minor',
        changes: [
          { type: 'feature', description: 'Comprehensive admin panel for managing AI providers (text generation, image generation, and text-to-speech)' },
          { type: 'feature', description: 'Dynamic provider configuration system with real-time switching between Gemini, OpenAI, Stable Diffusion, and DALL-E' },
          { type: 'feature', description: 'Admin role-based authentication system with secure access controls' },
          { type: 'feature', description: 'Provider health monitoring and automatic failover capabilities' },
          { type: 'improvement', description: 'Enhanced story generation - increased word count from 50-70 to 120-200 words per segment for richer storytelling' },
          { type: 'improvement', description: 'Refactored admin components into smaller, focused modules for better maintainability' },
          { type: 'improvement', description: 'Enhanced database trigger system for automatic story validation and cleanup' },
          { type: 'improvement', description: 'Improved error handling and logging across all edge functions for better debugging' },
          { type: 'improvement', description: 'Better provider configuration management with persistent settings storage' },
          { type: 'fix', description: 'Fixed TypeScript errors in admin components with proper type guards for spread operations' },
          { type: 'fix', description: 'Resolved database trigger validation issues that were preventing story creation' },
          { type: 'fix', description: 'Fixed story generation service reliability with improved error recovery' },
          { type: 'fix', description: 'Restored astronaut background image that was missing from the landing page' },
        ],
      },
      {
        version: '2.2.0',
        date: '2025-01-27',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Enhanced "Tale Forge" title with premium golden gradient styling and improved typography' },
          { type: 'improvement', description: 'Redesigned landing page layout with better proportions - reduced hero section to 40vh for improved content visibility' },
          { type: 'improvement', description: 'Made authentication and waitlist sections more prominent and accessible without scrolling' },
          { type: 'improvement', description: 'Added proper Playfair Display font loading for the main title with elegant serif styling' },
          { type: 'improvement', description: 'Implemented subtle breathing glow animation for the title with shimmer effects' },
          { type: 'improvement', description: 'Enhanced responsive design with better title scaling across all screen sizes' },
          { type: 'fix', description: 'Fixed title font rendering issues with proper Google Fonts integration' },
          { type: 'fix', description: 'Resolved layout issues that were hiding important content below the fold' },
        ],
      },
      {
        version: '2.1.2',
        date: '2025-01-27',
        type: 'patch',
        changes: [
          { type: 'fix', description: 'Fixed story mode card images not loading by implementing proper static image paths' },
          { type: 'fix', description: 'Resolved image loading issues with correct file name mapping and error handling' },
          { type: 'improvement', description: 'Enhanced image loading with proper lazy loading and fallback states' },
          { type: 'improvement', description: 'Improved error handling for missing images with graceful fallbacks' },
          { type: 'feature', description: 'Added comprehensive image loading diagnostics and error reporting' },
        ],
      },
      {
        version: '2.1.1',
        date: '2025-01-27',
        type: 'patch',
        changes: [
          { type: 'fix', description: 'Fixed story mode card images not displaying correctly with proper loading states' },
          { type: 'fix', description: 'Improved image error handling with better fallback states and user feedback' },
          { type: 'improvement', description: 'Enhanced story card image loading with skeleton states and error recovery' },
          { type: 'improvement', description: 'Optimized image loading performance with proper lazy loading and caching' },
          { type: 'feature', description: 'Added automatic changelog update system for tracking future changes' },
        ],
      },
      {
        version: '2.1.0',
        date: '2025-01-27',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Fixed story genre card images not loading properly' },
          { type: 'feature', description: 'Added waitlist functionality for user engagement' },
          { type: 'feature', description: 'Implemented changelog system to track updates' },
          { type: 'improvement', description: 'Enhanced responsive design across all screen sizes' },
          { type: 'improvement', description: 'Improved image loading with better fallback states' },
        ],
      },
      {
        version: '2.0.0',
        date: '2025-01-15',
        type: 'major',
        changes: [
          { type: 'feature', description: 'Interactive multimodal storytelling with AI-generated content' },
          { type: 'feature', description: 'Multiple story genres with visual themes' },
          { type: 'feature', description: 'Real-time story generation and progression' },
          { type: 'feature', description: 'User authentication and story persistence' },
          { type: 'feature', description: 'AI-generated images and audio for immersive experience' },
        ],
      },
    ];
  }
  
  // Add a new changelog entry
  static addEntry(entry: ChangelogEntry): void {
    if (typeof window === 'undefined') return;
    
    const current = this.getCurrentChangelog();
    const updated = [entry, ...current];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('changelog-updated', { detail: updated }));
  }
  
  // Generate version number based on change types
  static generateNextVersion(changes: ChangelogEntry['changes'], currentVersion: string = '2.6.0'): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    const hasMajor = changes.some(change => change.type === 'feature' && change.description.includes('breaking'));
    const hasMinor = changes.some(change => change.type === 'feature');
    const hasPatch = changes.some(change => change.type === 'fix' || change.type === 'improvement');
    
    if (hasMajor) {
      return `${major + 1}.0.0`;
    } else if (hasMinor) {
      return `${major}.${minor + 1}.0`;
    } else if (hasPatch) {
      return `${major}.${minor}.${patch + 1}`;
    }
    
    return currentVersion;
  }
  
  // Quick method to add changes
  static logChanges(changes: { type: 'feature' | 'improvement' | 'fix'; description: string }[]): void {
    const current = this.getCurrentChangelog();
    const currentVersion = current[0]?.version || '2.6.0';
    const nextVersion = this.generateNextVersion(changes, currentVersion);
    
    const entry: ChangelogEntry = {
      version: nextVersion,
      date: new Date().toISOString().split('T')[0],
      type: this.determineReleaseType(changes),
      changes: changes
    };
    
    this.addEntry(entry);
  }
  
  private static determineReleaseType(changes: { type: string }[]): 'major' | 'minor' | 'patch' {
    const hasFeature = changes.some(change => change.type === 'feature');
    const hasFix = changes.some(change => change.type === 'fix');
    
    if (hasFeature) {
      return 'minor';
    } else if (hasFix) {
      return 'patch';
    }
    return 'patch';
  }
}

export default ChangelogManager;

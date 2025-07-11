
import DOMPurify from 'dompurify';

// Input validation utilities
export const validateInput = {
  storyTitle: (title: string): string => {
    if (!title || title.trim().length === 0) {
      throw new Error('Story title is required');
    }
    if (title.length > 200) {
      throw new Error('Story title cannot exceed 200 characters');
    }
    return title.trim();
  },

  storyDescription: (description: string): string => {
    if (description && description.length > 1000) {
      throw new Error('Story description cannot exceed 1000 characters');
    }
    return description.trim();
  },

  segmentText: (text: string): string => {
    if (!text || text.trim().length === 0) {
      throw new Error('Story segment text is required');
    }
    if (text.length > 5000) {
      throw new Error('Story segment cannot exceed 5000 characters');
    }
    return text.trim();
  },

  choiceText: (choice: string): string => {
    if (choice && choice.length > 200) {
      throw new Error('Choice text cannot exceed 200 characters');
    }
    return choice.trim();
  },

  email: (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    return email.toLowerCase().trim();
  },

  // Enhanced validation for TaleForge story generation pipeline
  storyPrompt: (prompt: string): string => {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Story prompt is required');
    }
    if (prompt.length > 2000) {
      throw new Error('Story prompt cannot exceed 2000 characters');
    }
    
    // Check for potentially harmful content
    const harmfulPatterns = [
      /\b(kill|murder|suicide|violence|gore|torture)\b/i,
      /\b(nude|naked|sexual|erotic|adult|porn)\b/i,
      /\b(racist|sexist|bigot|hate)\b/i,
      /<script|javascript:|vbscript:|onload=|onerror=/i,
      /\b(hack|exploit|inject|malware|virus)\b/i
    ];
    
    const foundHarmful = harmfulPatterns.some(pattern => pattern.test(prompt));
    if (foundHarmful) {
      throw new Error('Story prompt contains inappropriate content. Please use family-friendly language.');
    }
    
    return prompt.trim();
  },

  storyGenre: (genre: string): string => {
    const validGenres = [
      'fantasy', 'sci-fi', 'mystery', 'adventure', 'horror', 'romance', 
      'thriller', 'comedy', 'drama', 'educational', 'child-adapted',
      'epic-fantasy', 'sci-fi-thriller', 'mystery-detective', 'romantic-drama',
      'adventure-quest', 'horror-story', 'comedy-adventure', 'historical-journey'
    ];
    
    if (!validGenres.includes(genre)) {
      throw new Error('Invalid story genre selected');
    }
    
    return genre;
  },

  imagePrompt: (prompt: string): string => {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Image prompt is required');
    }
    if (prompt.length > 1000) {
      throw new Error('Image prompt cannot exceed 1000 characters');
    }
    
    // Check for inappropriate image content
    const inappropriatePatterns = [
      /\b(nude|naked|sexual|erotic|adult|porn|explicit)\b/i,
      /\b(violence|gore|blood|torture|weapon)\b/i,
      /\b(racist|sexist|discriminatory|offensive)\b/i
    ];
    
    const foundInappropriate = inappropriatePatterns.some(pattern => pattern.test(prompt));
    if (foundInappropriate) {
      throw new Error('Image prompt contains inappropriate content. Please use family-friendly descriptions.');
    }
    
    return prompt.trim();
  },

  audioText: (text: string): string => {
    if (!text || text.trim().length === 0) {
      throw new Error('Audio text is required');
    }
    if (text.length > 10000) {
      throw new Error('Audio text cannot exceed 10000 characters');
    }
    
    return text.trim();
  }
};

// Content sanitization
export const sanitizeContent = {
  html: (content: string): string => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  text: (content: string): string => {
    // Remove any HTML tags and potentially dangerous characters
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
};

// Enhanced localStorage with encryption simulation
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      // In a real implementation, you'd use proper encryption here
      // For now, we'll use base64 encoding as a basic obfuscation
      const encodedValue = btoa(JSON.stringify(value));
      localStorage.setItem(`tf_${key}`, encodedValue);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  },

  getItem: (key: string): any => {
    try {
      const item = localStorage.getItem(`tf_${key}`);
      if (!item) return null;
      return JSON.parse(atob(item));
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(`tf_${key}`);
  },

  clear: (): void => {
    // Only clear TaleForge specific items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('tf_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Security headers for API requests
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};

// Rate limiting helper
export const rateLimiter = {
  requests: new Map<string, number[]>(),
  
  isAllowed: (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const requests = rateLimiter.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    rateLimiter.requests.set(key, validRequests);
    return true;
  }
};

// Story generation rate limiting
export const storyGenerationRateLimit = {
  requests: new Map<string, number[]>(),
  
  isAllowed: (userId: string | null, maxRequests: number = 10, windowMs: number = 60000): boolean => {
    const key = userId || 'anonymous';
    const now = Date.now();
    const requests = storyGenerationRateLimit.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    storyGenerationRateLimit.requests.set(key, validRequests);
    
    return true;
  },
  
  getRemainingRequests: (userId: string | null, maxRequests: number = 10, windowMs: number = 60000): number => {
    const key = userId || 'anonymous';
    const now = Date.now();
    const requests = storyGenerationRateLimit.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    return Math.max(0, maxRequests - validRequests.length);
  }
};

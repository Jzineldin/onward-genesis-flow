
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export const useStoryInitialization = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [storyLoaded, setStoryLoaded] = useState(false);

  // Get parameters from URL - make them stable
  const genre = searchParams.get('genre') || searchParams.get('mode') || 'fantasy';
  const prompt = searchParams.get('prompt') || '';
  const characterName = searchParams.get('characterName') || '';

  // Log the ID to help debug
  useEffect(() => {
    console.log('🆔 Story ID from params:', id);
  }, [id]);

  return {
    id,
    genre,
    prompt,
    characterName,
    isInitialLoad,
    setIsInitialLoad,
    storyLoaded,
    setStoryLoaded,
  };
};


import React, { useState } from 'react';
import { MagicalLibraryLayout } from '@/components/my-stories/MagicalLibraryLayout';
import { DeleteStoryDialog } from '@/components/my-stories/DeleteStoryDialog';
import { useUnifiedStories } from '@/hooks/useUnifiedStories';

const MyStories: React.FC = () => {
  const {
    stories,
    isLoading,
    handleRefresh,
    deleteStory,
    user
  } = useUnifiedStories();

  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [storyToDeleteTitle, setStoryToDeleteTitle] = useState<string>('');

  const handleSetStoryToDelete = (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    setStoryToDelete(storyId);
    setStoryToDeleteTitle(story?.title || 'Untitled Story');
  };

  const handleConfirmDelete = () => {
    if (storyToDelete) {
      deleteStory(storyToDelete);
      setStoryToDelete(null);
      setStoryToDeleteTitle('');
    }
  };

  const handleCancelDelete = () => {
    setStoryToDelete(null);
    setStoryToDeleteTitle('');
  };

  return (
    <>
      <MagicalLibraryLayout
        stories={stories}
        onSetStoryToDelete={handleSetStoryToDelete}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        showRefresh={true}
      />
      
      <DeleteStoryDialog
        isOpen={!!storyToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        storyTitle={storyToDeleteTitle}
      />
    </>
  );
};

export default MyStories;


import { useCallback, useEffect } from 'react';
import ChangelogManager from '@/utils/changelogManager';

interface ChangeEntry {
  type: 'feature' | 'improvement' | 'fix';
  description: string;
}

export const useChangelog = () => {
  const logChange = useCallback((change: ChangeEntry) => {
    ChangelogManager.logChanges([change]);
  }, []);

  const logChanges = useCallback((changes: ChangeEntry[]) => {
    ChangelogManager.logChanges(changes);
  }, []);

  const logFeature = useCallback((description: string) => {
    logChange({ type: 'feature', description });
  }, [logChange]);

  const logImprovement = useCallback((description: string) => {
    logChange({ type: 'improvement', description });
  }, [logChange]);

  const logFix = useCallback((description: string) => {
    logChange({ type: 'fix', description });
  }, [logChange]);

  // Remove the useEffect that was logging recent improvements since they're now in the main changelog
  // This prevents duplicate entries and ensures a clean changelog experience

  return {
    logChange,
    logChanges,
    logFeature,
    logImprovement,
    logFix,
  };
};

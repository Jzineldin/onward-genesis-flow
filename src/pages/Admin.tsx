
import React from 'react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import AdminHeader from '@/components/admin/AdminHeader';
import TextProviderSettings from '@/components/admin/TextProviderSettings';
import ImageProviderSettings from '@/components/admin/ImageProviderSettings';
import TTSProviderSettings from '@/components/admin/TTSProviderSettings';
import AIConnectionTest from '@/components/admin/AIConnectionTest';
import AdminWaitlistViewer from '@/components/admin/AdminWaitlistViewer';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const Admin: React.FC = () => {
  const { hasAccess, loading: accessLoading } = useAdminAccess();
  const { settings, setSettings, loading } = useAdminSettings();

  const updateTextProviders = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      textProviders: {
        ...prev.textProviders,
        [field]: value
      }
    }));
  };

  const updateImageProviders = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      imageProviders: {
        ...prev.imageProviders,
        [field]: value
      }
    }));
  };

  const updateTTSProviders = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      ttsProviders: {
        ...prev.ttsProviders,
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      const updates = [
        {
          key: 'text_providers',
          value: JSON.stringify(settings.textProviders),
        },
        {
          key: 'image_providers',
          value: JSON.stringify(settings.imageProviders),
        },
        {
          key: 'tts_providers',
          value: JSON.stringify(settings.ttsProviders),
        },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'key' });
        
        if (error) throw error;
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (accessLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-purple-200">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AIConnectionTest />
          <AdminWaitlistViewer />
        </div>

        <div className="space-y-8">
          <TextProviderSettings 
            settings={settings.textProviders}
            onUpdate={updateTextProviders}
          />
          
          <ImageProviderSettings 
            settings={settings.imageProviders}
            onUpdate={updateImageProviders}
          />
          
          <TTSProviderSettings 
            settings={settings.ttsProviders}
            onUpdate={updateTTSProviders}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={saveSettings}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

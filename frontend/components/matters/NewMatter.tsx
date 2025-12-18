import React, { useState } from 'react';
import { DataService } from '../../services/dataService';
import { Matter } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { MatterForm } from './MatterForm';
import { PATHS } from '../../config/paths.config';

export const NewMatter: React.FC = () => {
  const navigate = (path: string) => {
    window.location.hash = `#/${path}`;
  };
  const [saving, setSaving] = useState(false);

  const handleSave = async (matterData: Partial<Matter>) => {
    setSaving(true);
    try {
      // Generate matter number if not provided
      if (!matterData.matterNumber) {
        const year = new Date().getFullYear();
        const count = (await DataService.matters.getAll()).length + 1;
        matterData.matterNumber = `M${year}-${String(count).padStart(4, '0')}`;
      }

      const newMatter = await DataService.matters.add(matterData as Matter);
      navigate(`${PATHS.MATTERS}/${newMatter.id}`);
    } catch (error) {
      console.error('Failed to create matter:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(PATHS.MATTERS);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Matters
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <MatterForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

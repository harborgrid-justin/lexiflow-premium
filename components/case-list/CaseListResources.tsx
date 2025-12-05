
import React, { useState, useEffect } from 'react';
import { UserAvatar } from '../common/UserAvatar';
import { ProgressBar } from '../common/ProgressBar';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';

export const CaseListResources: React.FC = () => {
  const { theme } = useTheme();
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
      const loadData = async () => {
          const data = await DataService.hr.getUtilizationMetrics();
          setResources(data);
      };
      loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <div key={i} className={cn("p-6 rounded-lg border shadow-sm transition-all hover:border-blue-300", theme.surface, theme.border.default)}>
            <div className="flex items-center gap-4 mb-4">
              <UserAvatar name={res.name} size="lg"/>
              <div>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>{res.name}</h3>
                <p className={cn("text-sm", theme.text.secondary)}>{res.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <ProgressBar label="Utilization" value={res.utilization} colorClass={res.utilization > 90 ? 'bg-red-500' : 'bg-blue-600'} />
              <div className={cn("flex justify-between text-sm pt-2 border-t", theme.border.light)}>
                <span className={theme.text.secondary}>Active Matters</span>
                <span className={cn("font-bold", theme.text.primary)}>{res.cases}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

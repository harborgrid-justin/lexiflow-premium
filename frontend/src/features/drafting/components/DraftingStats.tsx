import { useTheme } from '@/contexts/theme/ThemeContext';
import { DraftingStats as StatsType } from '@api/domains/drafting.api';
import { CheckSquare, FileCode, FileText } from 'lucide-react';
import React from 'react';
import * as styles from '../DraftingDashboard.styles';

interface DraftingStatsProps {
  stats: StatsType;
}

export const DraftingStats: React.FC<DraftingStatsProps> = ({ stats }) => {
  const { tokens } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={styles.getStatCard(tokens.colors)}>
        <div>
          <div className={styles.getStatValue(tokens.colors)}>{stats.drafts}</div>
          <div className={styles.getStatLabel(tokens.colors)}>Active Drafts</div>
        </div>
        <div className={styles.getStatIcon(tokens.colors, 'blue')}>
          <FileText className="h-6 w-6" />
        </div>
      </div>

      <div className={styles.getStatCard(tokens.colors)}>
        <div>
          <div className={styles.getStatValue(tokens.colors)}>{stats.templates}</div>
          <div className={styles.getStatLabel(tokens.colors)}>Templates</div>
        </div>
        <div className={styles.getStatIcon(tokens.colors, 'emerald')}>
          <FileCode className="h-6 w-6" />
        </div>
      </div>

      <div className={styles.getStatCard(tokens.colors)}>
        <div>
          <div className={styles.getStatValue(tokens.colors)}>{stats.pendingReviews}</div>
          <div className={styles.getStatLabel(tokens.colors)}>Pending Review</div>
        </div>
        <div className={styles.getStatIcon(tokens.colors, 'amber')}>
          <CheckSquare className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

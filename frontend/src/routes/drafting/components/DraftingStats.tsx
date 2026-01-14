import { useTheme } from '@/features/theme';
import { DraftingStats as StatsType } from '@api/domains/drafting';
import { CheckSquare, FileCode, FileText } from 'lucide-react';
import * as styles from '../DraftingDashboard.styles';

interface DraftingStatsProps {
  stats: StatsType;
}

export const DraftingStats: React.FC<DraftingStatsProps> = ({ stats }) => {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={styles.getStatCard(theme)}>
        <div>
          <div className={styles.getStatValue(theme)}>{stats.drafts}</div>
          <div className={styles.getStatLabel(theme)}>Active Drafts</div>
        </div>
        <div className={styles.getStatIcon(theme, 'blue')}>
          <FileText className="h-6 w-6" />
        </div>
      </div>

      <div className={styles.getStatCard(theme)}>
        <div>
          <div className={styles.getStatValue(theme)}>{stats.templates}</div>
          <div className={styles.getStatLabel(theme)}>Templates</div>
        </div>
        <div className={styles.getStatIcon(theme, 'emerald')}>
          <FileCode className="h-6 w-6" />
        </div>
      </div>

      <div className={styles.getStatCard(theme)}>
        <div>
          <div className={styles.getStatValue(theme)}>{stats.pendingReviews}</div>
          <div className={styles.getStatLabel(theme)}>Pending Review</div>
        </div>
        <div className={styles.getStatIcon(theme, 'amber')}>
          <CheckSquare className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

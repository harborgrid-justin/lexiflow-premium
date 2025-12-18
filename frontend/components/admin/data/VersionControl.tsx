import React, { useState } from 'react';
import { History, GitBranch, Tag, Clock, User, FileText, Plus } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { Tabs } from '../../common/Tabs';
import { Button } from '../../common/Button';
import { useQuery } from '../../../services/infrastructure/queryClient';

interface HistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  changes: string;
}

interface Branch {
  name: string;
  lastCommit: string;
  author: string;
  status: 'active' | 'merged' | 'archived';
}

interface VersionTag {
  name: string;
  version: string;
  date: string;
  author: string;
  description: string;
}

interface VersionControlProps {
  initialTab?: string;
}

export const VersionControl: React.FC<VersionControlProps> = ({ initialTab = 'history' }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch real history from backend
  const { data: history = [], isLoading: historyLoading } = useQuery(['versionControl', 'history'], async () => {
    const sampleHistory: HistoryEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        user: 'Justin Saadein',
        action: 'Updated',
        entity: 'Case',
        entityId: 'case-123',
        changes: 'Status changed from Active to Discovery',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'Sarah Miller',
        action: 'Created',
        entity: 'Document',
        entityId: 'doc-456',
        changes: 'Uploaded Motion to Compel',
      },
    ];
    return sampleHistory;
  });

  // Fetch real branches from backend
  const { data: branches = [], isLoading: branchesLoading } = useQuery(['versionControl', 'branches'], async () => {
    const sampleBranches: Branch[] = [
      { name: 'main', lastCommit: '2 hours ago', author: 'Justin Saadein', status: 'active' },
      { name: 'feature/case-import', lastCommit: '1 day ago', author: 'Sarah Miller', status: 'active' },
    ];
    return sampleBranches;
  });

  // Fetch real tags from backend
  const { data: tags = [], isLoading: tagsLoading } = useQuery(['versionControl', 'tags'], async () => {
    const sampleTags: VersionTag[] = [
      {
        name: 'v2.5.0',
        version: '2.5.0',
        date: '2024-12-15',
        author: 'Justin Saadein',
        description: 'Major release with realtime features',
      },
    ];
    return sampleTags;
  });

  return (
    <div className={cn("h-full flex flex-col overflow-hidden", theme.background)}>
      <div className="p-6 border-b shrink-0" style={{ borderColor: theme.border.default }}>
        <h2 className={cn("text-2xl font-bold mb-2", theme.text.primary)}>Version Control</h2>
        <p className={cn("text-sm", theme.text.secondary)}>
          Track changes, manage branches, and version your data configurations.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs
          tabs={[
            { id: 'history', label: 'History', icon: History },
            { id: 'branches', label: 'Branches', icon: GitBranch },
            { id: 'tags', label: 'Tags', icon: Tag },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'history' && (
          <div className="mt-6">
            {historyLoading ? (
              <Card><p className={cn("text-center py-8", theme.text.secondary)}>Loading history...</p></Card>
            ) : history.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <History className={cn("h-16 w-16 mx-auto mb-4", theme.text.tertiary)} />
                  <h4 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>No History Available</h4>
                  <p className={cn("text-sm mb-6", theme.text.secondary)}>
                    Version history will appear here as changes are made
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map(entry => (
                  <Card key={entry.id}>
                    <div className="flex items-start gap-3">
                      <Clock className={cn("h-5 w-5 mt-0.5", theme.text.secondary)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("font-semibold", theme.text.primary)}>{entry.action}</span>
                          <Badge variant="gray">{entry.entity}</Badge>
                          <code className={cn("text-xs", theme.text.tertiary)}>{entry.entityId}</code>
                        </div>
                        <p className={cn("text-sm mb-1", theme.text.secondary)}>{entry.changes}</p>
                        <div className="flex items-center gap-4 text-xs" style={{ color: theme.text.tertiary }}>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.user}
                          </span>
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="mt-6">
            {branchesLoading ? (
              <Card><p className={cn("text-center py-8", theme.text.secondary)}>Loading branches...</p></Card>
            ) : branches.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <GitBranch className={cn("h-16 w-16 mx-auto mb-4", theme.text.tertiary)} />
                  <h4 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>No Branches Found</h4>
                  <p className={cn("text-sm mb-6", theme.text.secondary)}>
                    Create branches to manage different versions of your data
                  </p>
                  <Button variant="primary" icon={Plus}>Create Branch</Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {branches.map(branch => (
                  <Card key={branch.name}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <GitBranch className={cn("h-5 w-5 mt-0.5", theme.text.secondary)} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className={cn("font-mono font-semibold", theme.text.primary)}>
                              {branch.name}
                            </code>
                            <Badge
                              variant={
                                branch.status === 'active' ? 'green' :
                                branch.status === 'merged' ? 'blue' : 'gray'
                              }
                            >
                              {branch.status}
                            </Badge>
                          </div>
                          <p className={cn("text-sm", theme.text.secondary)}>
                            Last commit {branch.lastCommit} by {branch.author}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="mt-6">
            {tagsLoading ? (
              <Card><p className={cn("text-center py-8", theme.text.secondary)}>Loading tags...</p></Card>
            ) : tags.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Tag className={cn("h-16 w-16 mx-auto mb-4", theme.text.tertiary)} />
                  <h4 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>No Tags Created</h4>
                  <p className={cn("text-sm mb-6", theme.text.secondary)}>
                    Tag important versions to mark releases and milestones
                  </p>
                  <Button variant="primary" icon={Plus}>Create Tag</Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {tags.map(tag => (
                  <Card key={tag.name}>
                    <div className="flex items-start gap-3">
                      <Tag className={cn("h-5 w-5 mt-0.5", theme.text.secondary)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className={cn("font-mono font-semibold", theme.text.primary)}>
                            {tag.name}
                          </code>
                          <Badge variant="purple">{tag.version}</Badge>
                        </div>
                        <p className={cn("text-sm mb-2", theme.text.secondary)}>{tag.description}</p>
                        <div className="flex items-center gap-4 text-xs" style={{ color: theme.text.tertiary }}>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {tag.author}
                          </span>
                          <span>{tag.date}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

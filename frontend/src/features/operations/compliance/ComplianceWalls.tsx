import { Button } from '@/shared/ui/atoms/Button/Button';
import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/features/theme';
import { EthicalWall } from '@/types';
import { cn } from '@/shared/lib/cn';
import { Briefcase, CheckCircle, Lock, Plus, Users } from 'lucide-react';
import { memo } from 'react';

interface ComplianceWallsProps {
    walls: EthicalWall[];
}

const ComplianceWallsComponent: React.FC<ComplianceWallsProps> = ({ walls }) => {
    const { theme } = useTheme();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>Information Barriers</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Manage ethical walls and restrict access to sensitive matters.</p>
                </div>
                <Button variant="primary" icon={Plus}>Create Wall</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {walls.map(w => (
                    <Card key={w.id} noPadding className={cn("flex flex-col md:flex-row justify-between items-stretch transition-all hover:shadow-md overflow-hidden", `hover:${theme.border.default}`)}>
                        <div className={cn("w-2 bg-red-500 md:w-2 md:h-auto h-2")}></div>

                        <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>{w.title}</h3>
                                    <span className={cn("text-xs px-2 py-0.5 rounded font-bold uppercase", theme.status.success.bg, theme.status.success.text)}>Active</span>
                                </div>
                                <p className={cn("text-sm mb-4 flex items-center", theme.text.secondary)}>
                                    <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Matter Ref: <span className={cn("font-mono ml-1", theme.text.primary)}>{w.caseId}</span>
                                </p>

                                <div className="flex items-center text-xs text-green-600 font-medium">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Enforced via IAM Policy
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 md:border-l pl-0 md:pl-6 border-slate-100 dark:border-slate-800">
                                <div>
                                    <span className={cn("text-xs font-bold uppercase mb-2 flex items-center", theme.text.secondary)}>
                                        <Lock className="h-3 w-3 mr-1" /> Restricted
                                    </span>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {w.restrictedGroups.map(g => (
                                            <span key={g} className={cn("px-2 py-1 rounded text-xs border bg-red-50 border-red-100 text-red-700")}>{g}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className={cn("text-xs font-bold uppercase mb-2 flex items-center", theme.text.secondary)}>
                                        <Users className="h-3 w-3 mr-1" /> Authorized
                                    </span>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {w.authorizedUsers.map(u => (
                                            <span key={u} className={cn("px-2 py-1 rounded text-xs border bg-green-50 border-green-100 text-green-700")}>{u}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn("flex md:flex-col items-center justify-center p-4 border-t md:border-t-0 md:border-l gap-2", theme.surface.highlight, theme.border.default)}>
                            <Button variant="ghost" size="sm" className="w-full">Audit Log</Button>
                            <Button variant="outline" size="sm" className="w-full">Edit Policy</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export const ComplianceWalls = memo(ComplianceWallsComponent);
ComplianceWalls.displayName = 'ComplianceWalls';

/**
 * @module components/practice/FacilitiesManager
 * @category Practice Management
 * @description Facilities, lease, and maintenance management.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, Grid, Key, Loader2, MapPin, Users, Wrench } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { MetricTile } from '@/components/organisms/_legacy/RefactoredCommon';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Card } from '@/components/ui/molecules/Card/Card';
import { Tabs } from '@/components/ui/molecules/Tabs/Tabs';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export const FacilitiesManager: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('locations');

    const operationsService = DataService.operations as {
        getMaintenanceTickets: () => Promise<unknown[]>;
        getFacilities: () => Promise<unknown[]>;
        getLeaseMetrics: () => Promise<{ totalSqFt: number; monthlyRent: number; expiringLeases: number }>;
    };

    const { data: rawTickets = [], isLoading: ticketsLoading } = useQuery<unknown[]>(
        ['maintenance-tickets', 'all'],
        operationsService.getMaintenanceTickets
    );

    // Ensure tickets is always an array
    const tickets = Array.isArray(rawTickets)
        ? rawTickets
        : (Array.isArray((rawTickets as { data?: unknown[] })?.data) ? (rawTickets as { data: unknown[] }).data : []);

    const { data: locations = [], isLoading: locationsLoading } = useQuery<unknown[]>(
        ['facilities', 'all'],
        async () => {
            const result = await operationsService.getFacilities();
            return Array.isArray(result) ? result : [];
        }
    );

    const { data: leaseMetrics = { totalSqFt: 0, monthlyRent: 0, expiringLeases: 0 }, isLoading: metricsLoading } = useQuery(
        ['lease-metrics'],
        operationsService.getLeaseMetrics
    );

    const isLoading = ticketsLoading || locationsLoading || metricsLoading;

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
                <div className="mb-4">
                    <h2 className={cn("text-xl font-bold", theme.text.primary)}>Facilities & Real Estate</h2>
                    <p className={cn("text-sm", theme.text.secondary)}>Manage physical assets, leases, and office operations.</p>
                </div>
                <div className="mt-4">
                    <Tabs
                        tabs={[
                            { id: 'locations', label: 'Locations Directory', icon: MapPin },
                            { id: 'leases', label: 'Lease Management', icon: Key },
                            { id: 'maintenance', label: 'Maintenance Tickets', icon: Wrench },
                            { id: 'floorplan', label: 'Space Planning', icon: Grid },
                            { id: 'visitors', label: 'Visitor Logs', icon: Users },
                        ]}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-blue-600" /></div> : (
                    <>
                        {activeTab === 'locations' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.isArray(locations) && locations.map((l: unknown) => {
                                    const loc = l as { id: string; name?: string; capacity?: number; staffCount?: number; status?: string };
                                    return (
                                        <Card key={loc.id} title={loc.name || 'Unnamed Location'} className="hover:shadow-md transition-shadow cursor-pointer">
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between"><span className={theme.text.secondary}>Capacity</span> <span className="font-bold">{(loc.capacity || 0) * 100}%</span></div>
                                                <div className="flex justify-between"><span className={theme.text.secondary}>Staff</span> <span className="font-bold">{loc.staffCount || 0}</span></div>
                                                <div className="flex justify-between"><span className={theme.text.secondary}>Status</span> <span className="text-green-600 font-bold">{loc.status || 'N/A'}</span></div>
                                                <div className="w-full h-32 bg-slate-100 rounded mt-4 flex items-center justify-center text-slate-400 text-xs">Map Placeholder</div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'leases' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <MetricTile label="Total Sq Ft" value={leaseMetrics.totalSqFt.toLocaleString()} icon={Grid} />
                                    <MetricTile label="Monthly Rent" value={`$${(leaseMetrics.monthlyRent / 1000).toFixed(0)}k`} icon={Key} />
                                    <MetricTile label="Expiring (Year)" value={leaseMetrics.expiringLeases.toString()} icon={AlertTriangle} trend="Action Required" trendUp={false} />
                                </div>
                                <Card title="Lease Portfolio">
                                    {/* Lease Table logic would go here */}
                                    <div className={cn("p-4 text-center text-sm", theme.text.secondary)}>Lease portfolio details table...</div>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'maintenance' && (
                            <div className="space-y-4 animate-fade-in">
                                <TableContainer>
                                    <TableHeader><TableHead>ID</TableHead><TableHead>Location</TableHead><TableHead>Issue</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead></TableHeader>
                                    <TableBody>
                                        {tickets.map((tick: unknown) => {
                                            const t = tick as { id: string; loc?: string; issue?: string; priority?: string; status?: string };
                                            return (
                                                <TableRow key={t.id}>
                                                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                                    <TableCell>{t.loc || 'N/A'}</TableCell>
                                                    <TableCell className="font-medium">{t.issue || 'No description'}</TableCell>
                                                    <TableCell><Badge variant={t.priority === 'High' ? 'error' : 'neutral'}>{t.priority || 'Normal'}</Badge></TableCell>
                                                    <TableCell><Badge variant={t.status === 'Open' ? 'warning' : t.status === 'Closed' ? 'success' : 'info'}>{t.status || 'Pending'}</Badge></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </TableContainer>
                            </div>
                        )}

                        {activeTab === 'floorplan' && (
                            <div className={cn("flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12", theme.border.default)}>
                                <div className="text-center">
                                    <Grid className={cn("h-16 w-16 mx-auto mb-4", theme.text.tertiary)} />
                                    <h3 className={cn("text-lg font-bold", theme.text.primary)}>Interactive Floorplan</h3>
                                    <p className={theme.text.secondary}>Drag and drop seating assignments module.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

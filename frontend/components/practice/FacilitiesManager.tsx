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
import React, { useState } from 'react';
import { MapPin, Key, Wrench, Grid, Users, Plus, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../hooks/useQueryHooks';
// TODO: Migrate to backend API - IndexedDB deprecated
import { STORES } from '../../services/data/db';
import { queryKeys } from '../../utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Tabs } from '../common/Tabs';
import { Card } from '../common/Card';
import { MetricTile, ActionRow } from '../common/RefactoredCommon';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Badge } from '../common/Badge';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export const FacilitiesManager: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('locations');

    const { data: tickets = [], isLoading: ticketsLoading } = useQuery<any[]>(
        [STORES.MAINTENANCE_TICKETS, 'all'],
        DataService.operations.getMaintenanceTickets
    );
    
    const { data: locations = [], isLoading: locationsLoading } = useQuery<any[]>(
        [STORES.FACILITIES, 'all'],
        DataService.operations.getFacilities
    );

    const isLoading = ticketsLoading || locationsLoading;

    return (
        <div className="flex flex-col h-full space-y-4">
             <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
                <ActionRow title="Facilities & Real Estate" subtitle="Manage physical assets, leases, and office operations.">
                    <button className={cn("px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700")}>Log Maintenance</button>
                </ActionRow>
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
                {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-blue-600"/></div> : (
                    <>
                        {activeTab === 'locations' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {locations.map(loc => (
                                    <Card key={loc.id} title={loc.name} className="hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between"><span className={theme.text.secondary}>Capacity</span> <span className="font-bold">{loc.capacity * 100}%</span></div>
                                            <div className="flex justify-between"><span className={theme.text.secondary}>Staff</span> <span className="font-bold">{loc.staffCount}</span></div>
                                            <div className="flex justify-between"><span className={theme.text.secondary}>Status</span> <span className="text-green-600 font-bold">{loc.status}</span></div>
                                            <div className="w-full h-32 bg-slate-100 rounded mt-4 flex items-center justify-center text-slate-400 text-xs">Map Placeholder</div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {activeTab === 'leases' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <MetricTile label="Total Sq Ft" value="125,000" icon={Grid} />
                                     <MetricTile label="Monthly Rent" value="$450k" icon={Key} />
                                     <MetricTile label="Expiring (Year)" value="1" icon={AlertTriangle} trend="Action Required" trendUp={false} />
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
                                        {tickets.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                                <TableCell>{t.loc}</TableCell>
                                                <TableCell className="font-medium">{t.issue}</TableCell>
                                                <TableCell><Badge variant={t.priority === 'High' ? 'error' : 'neutral'}>{t.priority}</Badge></TableCell>
                                                <TableCell><Badge variant={t.status === 'Open' ? 'warning' : t.status === 'Closed' ? 'success' : 'info'}>{t.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </TableContainer>
                            </div>
                        )}

                        {activeTab === 'floorplan' && (
                            <div className={cn("flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12", theme.border.default)}>
                                <div className="text-center">
                                    <Grid className={cn("h-16 w-16 mx-auto mb-4", theme.text.tertiary)}/>
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



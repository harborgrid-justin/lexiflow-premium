'use client';

// Mock domains and types for stability
// import { ProfileDomain } from '@/services/domain/ProfileDomain';
// import { ExtendedUserProfile } from '@/types';

import { Activity, Key, Lock, Mail, MapPin, Phone, Settings, Shield, Sliders, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/shadcn/table';
import { Badge } from '@/components/ui/shadcn/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';

// Local types
interface AccessPermission {
    resource: string;
    read: boolean;
    write: boolean;
    delete: boolean;
}

interface UserPreferences {
    theme: string;
    locale: string;
    notifications: boolean;
}

interface UserSecurity {
    lastPasswordChange: string;
    mfaEnabled: boolean;
    mfaMethod?: string;
}

interface ExtendedUserProfile {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
    location?: string;
    preferences?: UserPreferences;
    accessMatrix?: AccessPermission[];
    security?: UserSecurity;
}

const ProfileOverview = ({ profile }: { profile: ExtendedUserProfile }) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-32 w-32">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-muted-foreground">{profile.role}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.location || 'N/A'}</span>
                        </div>
                    </div>
                    <Button>Edit Profile</Button>
                </div>
            </div>
        </CardContent>
    </Card>
);

const PreferencePane = ({ preferences }: { preferences?: UserPreferences }) => (
    <Card>
        <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your workspace experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">Choose your interface theme.</p>
                </div>
                <Select defaultValue={preferences?.theme || 'system'}>
                    <SelectTrigger className="w-45">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium">Language</h4>
                    <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                </div>
                <Select defaultValue={preferences?.locale || 'en-US'}>
                    <SelectTrigger className="w-45">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
    </Card>
);

const AccessMatrixEditor = ({ accessMatrix }: { accessMatrix?: AccessPermission[] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Access Matrix</CardTitle>
            <CardDescription>View your granular permissions across modules.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead className="text-center">Read</TableHead>
                        <TableHead className="text-center">Write</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(accessMatrix || [{ resource: 'Cases' }, { resource: 'Documents' }]).map((p: any) => (
                        <TableRow key={p.resource}>
                            <TableCell className="font-medium">{p.resource}</TableCell>
                            <TableCell className="text-center text-emerald-600">✓</TableCell>
                            <TableCell className="text-center text-emerald-600">✓</TableCell>
                            <TableCell className="text-center text-muted-foreground">-</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const SecurityPane = ({ security }: { security?: UserSecurity }) => (
    <Card>
        <CardHeader>
            <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-medium">Password</h4>
                        <p className="text-sm text-muted-foreground">Last changed {security?.lastPasswordChange || 'Never'}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                            {security?.mfaEnabled ? `Enabled (${security.mfaMethod})` : 'Disabled'}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                        <Key className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-medium">API Keys</h4>
                        <p className="text-sm text-muted-foreground">Manage personal access tokens</p>
                    </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
            </div>
        </CardContent>
    </Card>
);

export default function UserProfileManager() {
    const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock load
        setProfile({
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Partner',
            preferences: { theme: 'system', locale: 'en-US', notifications: true },
            security: { lastPasswordChange: '2024-01-01', mfaEnabled: true, mfaMethod: 'Authenticator' }
        });
        setLoading(false);
    }, []);

    if (!profile) return null;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="gap-2"><UserCircle size={16} /> Overview</TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2"><Sliders size={16} /> Preferences</TabsTrigger>
                    <TabsTrigger value="access" className="gap-2"><Settings size={16} /> Access</TabsTrigger>
                    <TabsTrigger value="security" className="gap-2"><Shield size={16} /> Security</TabsTrigger>
                    <TabsTrigger value="audit" className="gap-2"><Activity size={16} /> Audit Log</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <ProfileOverview profile={profile} />
                </TabsContent>
                <TabsContent value="preferences">
                    <PreferencePane preferences={profile.preferences} />
                </TabsContent>
                <TabsContent value="access">
                    <AccessMatrixEditor accessMatrix={profile.accessMatrix} />
                </TabsContent>
                <TabsContent value="security">
                    <SecurityPane security={profile.security} />
                </TabsContent>
                <TabsContent value="audit">
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            Audit logs visualization coming soon.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

'use client';

import { Activity, Key, Lock, Mail, MapPin, Phone, Settings, Shield, Sliders, UserCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { DataService } from '@/services/data/dataService';

export const UserProfileManager = () => {
    const [profile, setProfile] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                // Using DataService to get current user profile
                // Assuming DataService.users or similar
                const user = await DataService.users ? DataService.users.getCurrentUser() : {
                    id: 'current',
                    name: 'Justine Case',
                    role: 'Senior Associate',
                    email: 'justine@lexiflow.ai',
                    phone: '555-0123'
                };
                setProfile(user);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    if (!profile) return <div>Failed to load profile.</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-sm">
                            <AvatarImage src={profile.avatarUrl} />
                            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                {profile.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                                <Badge variant="secondary" className="mt-1">{profile.role}</Badge>
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
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Edit Account
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="security" className="w-full">
                <TabsList>
                    <TabsTrigger value="security">Security & Access</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Control</CardTitle>
                            <CardDescription>Permissions and roles assigned to your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-5 w-5 text-emerald-500" />
                                <span className="font-medium">Role: {profile.role}</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Managed by Organization Administrator.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="preferences">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground">User preferences settings here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

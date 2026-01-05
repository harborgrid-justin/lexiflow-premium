
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { Input } from '../common/Inputs.tsx';

export const UserSettings: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card title="Profile Information">
                <div className="flex items-center gap-6 mb-6">
                    <div className="flex flex-col items-center gap-2">
                        <UserAvatar name="Alexandra H." size="lg" className="w-24 h-24 text-2xl"/>
                        <button className="text-xs text-blue-600 font-bold hover:underline">Change Photo</button>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue="Alexandra"/>
                            <Input label="Last Name" defaultValue="Hamilton"/>
                        </div>
                        <Input label="Email" defaultValue="alex@lexiflow.com" disabled/>
                        <Input label="Job Title" defaultValue="Senior Partner"/>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="primary">Save Changes</Button>
                </div>
            </Card>

            <Card title="Preferences">
                <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm text-slate-800">Email Notifications</p>
                            <p className="text-xs text-slate-500">Receive summaries and alerts via email.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle"/>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm text-slate-800">Dark Mode</p>
                            <p className="text-xs text-slate-500">Switch interface theme.</p>
                        </div>
                        <input type="checkbox" className="toggle"/>
                    </div>
                </div>
            </Card>
        </div>
    );
};


import { Globe, Lock, Smartphone } from 'lucide-react';
import React from 'react';
import { Card } from '../common/Card.tsx';

export const SecuritySettings: React.FC = () => {
    return (
        <div className="max-w-4xl space-y-6">
            <Card title="Authentication Policy">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded bg-slate-50">
                        <div className="flex gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Smartphone size={20} /></div>
                            <div>
                                <h4 className="font-bold text-sm">Two-Factor Authentication (2FA)</h4>
                                <p className="text-xs text-slate-500">Require 2FA for all employees.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked readOnly onClick={() => alert("2FA Policy is enforced globally. Contact IT to disable.")} />
                            <div style={{ backgroundColor: 'var(--color-surfaceHover)' }} className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded bg-slate-50">
                        <div className="flex gap-3">
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Lock size={20} /></div>
                            <div>
                                <h4 className="font-bold text-sm">Single Sign-On (SSO)</h4>
                                <p className="text-xs text-slate-500">SAML 2.0 Identity Provider (Okta/Azure).</p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:underline" onClick={() => alert("Redirecting to Identity Provider Configuration...")}>Configure</button>
                    </div>
                </div>
            </Card>

            <Card title="Network Access Control">
                <div className="space-y-4">
                    <div className="flex gap-3 p-4 border rounded">
                        <Globe size={20} className="text-slate-400 mt-1" />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">IP Whitelisting</h4>
                            <p className="text-xs text-slate-500 mb-2">Limit access to specific corporate IP ranges.</p>
                            <textarea className="w-full border rounded p-2 text-xs font-mono" rows={3} defaultValue="192.168.1.0/24\n10.0.0.0/8" onChange={() => { }}></textarea>
                            <button style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} className="mt-2 text-xs px-3 py-1 rounded hover:opacity-90 transition-colors" onClick={() => alert("Firewall rules updated successfully.")}>Save Rules</button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

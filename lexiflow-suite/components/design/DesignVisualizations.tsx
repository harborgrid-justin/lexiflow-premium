
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { SectionHeading, DemoContainer, ComponentLabel } from './DesignHelpers.tsx';

export const DesignVisualizations = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
        <SectionHeading title="Data Visualization" icon={BarChart3} count="VZ-01 to VZ-65" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <DemoContainer>
                <ComponentLabel id="VZ-01" name="Area Sparkline" />
                <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{v:10},{v:15},{v:8},{v:22},{v:18},{v:35},{v:30}]}>
                            <defs>
                                <linearGradient id="colorVz01" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#colorVz01)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </DemoContainer>
            <DemoContainer>
                <ComponentLabel id="VZ-02" name="Donut Chart" />
                <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={[{v:60},{v:40}]} dataKey="v" innerRadius={20} outerRadius={30} stroke="none">
                                <Cell fill="#3b82f6"/><Cell fill="#e2e8f0"/>
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </DemoContainer>
        </div>
    </div>
  );
};

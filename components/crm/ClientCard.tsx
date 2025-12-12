
import React from 'react';
import { Client } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Currency } from '../common/Primitives';
import { Lock, PieChart, Building } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ClientCardProps {
    client: Client;
    onGenerateToken: (id: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onGenerateToken }) => {
    const { theme } = useTheme();

    return (
        <div className={cn("p-6 rounded-lg border shadow-sm transition-all hover:shadow-md group", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg border", theme.primary.light, theme.primary.text, theme.primary.border)}>
                {client.name.substring(0, 2)}
            </div>
            <Badge variant={client.status === 'Active' ? 'success' : 'neutral'}>{client.status}</Badge>
            </div>
            
            <h3 className={cn("font-bold text-lg mb-1", theme.text.primary)}>{client.name}</h3>
            <p className={cn("text-sm flex items-center mb-4", theme.text.secondary)}>
            <Building className="h-3 w-3 mr-1"/> {client.industry}
            </p>
            
            <div className={cn("grid grid-cols-2 gap-4 text-sm pt-4 border-t", theme.border.light)}>
            <div>
                <p className={cn("text-[10px] uppercase font-bold", theme.text.tertiary)}>Lifetime Billed</p>
                <Currency value={client.totalBilled} className={cn("font-bold", theme.text.primary)} />
            </div>
            <div>
                <p className={cn("text-[10px] uppercase font-bold", theme.text.tertiary)}>Active Matters</p>
                <p className={cn("font-bold", theme.text.primary)}>{client.matters.length}</p>
            </div>
            </div>

            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1" icon={Lock} onClick={() => onGenerateToken(client.id)}>Portal</Button>
                <Button size="sm" variant="ghost" className="px-2" icon={PieChart} />
            </div>
        </div>
    );
};

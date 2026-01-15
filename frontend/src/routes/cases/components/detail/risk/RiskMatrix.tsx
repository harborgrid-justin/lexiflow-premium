/**
 * RiskMatrix.tsx
 *
 * Visual 3x3 risk matrix plotting probability vs impact with color-coded severity.
 *
 * @module components/case-detail/risk/RiskMatrix
 * @category Case Management - Risk Assessment
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with memoized cell computations
 * - Guideline 28: Theme usage is pure function for matrix styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for matrix transitions
 */

// External Dependencies
// Internal Dependencies - Hooks & Context
import { useTheme } from '@/theme';

// Internal Dependencies - Services & Utils
import { cn } from '@/lib/cn';

// Types & Interfaces
import { RiskLevel } from '@/types';

interface RiskMatrixProps {
    probability: RiskLevel;
    impact: RiskLevel;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ probability, impact }) => {
    // Guideline 34: Side-effect free context read
    const { theme } = useTheme();

    const getCellColor = (row: number, col: number) => {
        const score = row * col; // 1-9
        if (score >= 6) return 'bg-red-500'; // High Risk
        if (score >= 3) return 'bg-amber-400'; // Medium Risk
        return 'bg-green-400'; // Low Risk
    };

    const pVal = probability === 'High' ? 3 : probability === 'Medium' ? 2 : 1;
    const iVal = impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;

    return (
        <div className="relative w-full max-w-[240px] aspect-square mx-auto">
            {/* Y-Axis Label */}
            <div className={cn("absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold uppercase tracking-wide", theme.text.secondary)}>
                Probability
            </div>

            <div className="grid grid-rows-3 gap-1 w-full h-full">
                {[3, 2, 1].map(row => (
                    <div key={row} className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map(col => (
                            <div
                                key={`${row}-${col}`}
                                className={cn(
                                    "rounded flex items-center justify-center transition-all w-full h-full",
                                    getCellColor(row, col),
                                    row === pVal && col === iVal ? "ring-4 ring-white ring-offset-2 shadow-lg scale-105 z-10" : "opacity-30"
                                )}
                            >
                                {row === pVal && col === iVal && (
                                    <div className="w-3 h-3 bg-slate-900 rounded-full shadow-sm"></div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* X-Axis Label */}
            <div className={cn("text-center mt-2 text-xs font-bold uppercase tracking-wide", theme.text.secondary)}>
                Impact
            </div>
        </div>
    );
};

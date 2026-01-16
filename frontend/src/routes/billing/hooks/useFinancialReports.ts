import {
    billingApiService,
    type MatterProfitability,
    type ProfitabilityMetrics,
    type RealizationMetrics,
    type RevenueForecasting,
    type TimekeeperPerformance,
    type WorkInProgressMetrics
} from '@/lib/frontend-api';
import { FinancialReportTab, ReportPeriod } from '@/config/billing.config';
import { useEffect, useState } from 'react';

interface UseFinancialReportsProps {
    dateRange?: { start: string; end: string };
}

export const useFinancialReports = ({ dateRange }: UseFinancialReportsProps) => {
    const [selectedTab, setSelectedTab] = useState<FinancialReportTab>('profitability');
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('monthly');
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for API data
    const [profitability, setProfitability] = useState<ProfitabilityMetrics | null>(null);
    const [realization, setRealization] = useState<RealizationMetrics | null>(null);
    const [wipMetrics, setWipMetrics] = useState<WorkInProgressMetrics | null>(null);
    const [revenueForecast, setRevenueForecast] = useState<RevenueForecasting[]>([]);
    const [timekeeperPerformance, setTimekeeperPerformance] = useState<TimekeeperPerformance[]>([]);
    const [matterProfitability, setMatterProfitability] = useState<MatterProfitability[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const filters = dateRange
                    ? { startDate: dateRange.start, endDate: dateRange.end }
                    : undefined;

                const [
                    profitabilityData,
                    realizationData,
                    wipData,
                    forecastData,
                    performanceData,
                    matterData,
                ] = await Promise.all([
                    billingApiService.getProfitabilityMetrics(filters),
                    billingApiService.getRealizationMetrics(filters),
                    billingApiService.getWIPMetrics(filters),
                    billingApiService.getRevenueForecast(filters),
                    billingApiService.getTimekeeperPerformance(filters),
                    billingApiService.getMatterProfitability(filters),
                ]);

                setProfitability(profitabilityData);
                setRealization(realizationData);
                setWipMetrics(wipData);
                setRevenueForecast(forecastData);
                setTimekeeperPerformance(performanceData);
                setMatterProfitability(matterData);
            } catch (err) {
                console.error('Failed to fetch financial reports:', err);
                setError('Failed to load financial data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    return {
        selectedTab,
        setSelectedTab,
        selectedPeriod,
        setSelectedPeriod,
        showFilters,
        setShowFilters,
        isLoading,
        error,
        data: {
            profitability,
            realization,
            wipMetrics,
            revenueForecast,
            timekeeperPerformance,
            matterProfitability
        }
    };
};

export const useFinancialHelpers = () => {
    const getPerformanceColor = (value: number, threshold: number = 90) => {
        if (value >= threshold) return 'text-green-600 dark:text-green-400';
        if (value >= threshold - 10) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`;
    };

    const formatPercent = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    return { getPerformanceColor, formatCurrency, formatPercent };
};

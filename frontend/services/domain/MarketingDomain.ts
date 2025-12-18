
import { MarketingMetric, MarketingCampaign } from '../../types';
import { delay } from '../../utils/async';
import { MOCK_METRICS } from '../../data/models/marketingMetric';
export const MarketingService = {
    getMetrics: async (): Promise<MarketingMetric[]> => {
        await delay(200);
        return MOCK_METRICS;
    },
    
    getCampaigns: async (): Promise<MarketingCampaign[]> => {
        return [
              { id: '1', name: 'Q1 Webinar Series', target: 'Corporate Counsel', status: 'Active', budget: '$2,000/mo' },
              { id: '2', name: 'Google Ads - "Commercial Lit"', target: 'Small Business', status: 'Active', budget: '$2,000/mo' },
              { id: '3', name: 'LegalTech Conference Sponsor', target: 'Industry Wide', status: 'Upcoming', dates: 'Sep 15-18' },
        ];
    }
};


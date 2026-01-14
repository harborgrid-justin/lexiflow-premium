/**
 * Real Estate Domain - Page Component
 */

import { RealEstateProvider } from './RealEstateProvider';
import { RealEstateView } from './RealEstateView';

export function RealEstatePage() {
  return (
    <RealEstateProvider>
      <RealEstateView />
    </RealEstateProvider>
  );
}

export default RealEstatePage;

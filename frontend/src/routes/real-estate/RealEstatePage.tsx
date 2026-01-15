/**
 * Real Estate Domain - Page Component
 */

import { useLoaderData } from 'react-router';
import type { RealEstateLoaderData } from './loader';
import { RealEstateProvider } from './RealEstateProvider';
import { RealEstateView } from './RealEstateView';

export function RealEstatePage() {
  const initialData = useLoaderData() as RealEstateLoaderData;

  return (
    <RealEstateProvider initialData={initialData}>
      <RealEstateView />
    </RealEstateProvider>
  );
}

export default RealEstatePage;

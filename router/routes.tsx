/**
 * Routes Configuration
 * Centralized route definitions with lazy loading
 */

import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Lazy load page components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Cases = lazy(() => import('../pages/Cases'));
const CaseDetail = lazy(() => import('../pages/CaseDetail'));
const Documents = lazy(() => import('../pages/Documents'));
const Clients = lazy(() => import('../pages/Clients'));
const Billing = lazy(() => import('../pages/Billing'));
const Settings = lazy(() => import('../pages/Settings'));
const Login = lazy(() => import('../pages/Login'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Wrapper component for lazy loaded routes
interface LazyRouteProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  [key: string]: any;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ component: Component, ...rest }) => {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" fullScreen message="Loading page..." />}>
      <Component {...rest} />
    </Suspense>
  );
};

// Route configuration
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  requiredRole?: string | string[];
  children?: RouteConfig[];
}

export const routeConfig: RouteConfig[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <LazyRoute component={Dashboard} />
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/cases',
    element: (
      <ProtectedRoute>
        <LazyRoute component={Cases} />
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/cases/:id',
    element: (
      <ProtectedRoute>
        <LazyRoute component={CaseDetail} />
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/documents',
    element: (
      <ProtectedRoute>
        <LazyRoute component={Documents} />
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/clients',
    element: (
      <ProtectedRoute>
        <LazyRoute component={Clients} />
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/billing',
    element: (
      <ProtectedRoute>
        <LazyRoute component={Billing} />
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <LazyRoute component={Settings} />
      </ProtectedRoute>
    ),
    protected: true,
  },
  {
    path: '/login',
    element: <LazyRoute component={Login} />,
    protected: false,
  },
  {
    path: '/unauthorized',
    element: <LazyRoute component={Unauthorized} />,
    protected: false,
  },
  {
    path: '*',
    element: <LazyRoute component={NotFound} />,
    protected: false,
  },
];

export default routeConfig;

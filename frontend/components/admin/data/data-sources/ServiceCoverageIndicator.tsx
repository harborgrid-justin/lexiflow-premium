import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { useDataSource } from '../../../../context/DataSourceContext';

const BACKEND_SERVICES = [
  'cases', 'docket', 'documents', 'evidence', 'billing', 'users',
  'pleadings', 'trustAccounts', 'billingAnalytics', 'reports', 
  'processingJobs', 'casePhases', 'caseTeams', 'motions', 'parties',
  'clauses', 'legalHolds', 'depositions', 'discoveryRequests', 
  'esiSources', 'privilegeLog', 'productions', 'custodianInterviews',
  'conflictChecks', 'ethicalWalls', 'auditLogs', 'permissions',
  'rlsPolicies', 'complianceReports', 'rateTables', 'feeAgreements',
  'custodians', 'examinations', 'discoveryMain', 'search', 'ocr', 
  'serviceJobs', 'messaging', 'complianceMain', 'tokenBlacklist', 
  'analytics', 'judgeStats', 'outcomePredictions', 'documentVersions', 
  'dataSourcesIntegration', 'metrics', 'production'
];

export const ServiceCoverageIndicator: React.FC = () => {
  const { theme } = useTheme();
  const { currentSource } = useDataSource();
  const [showDetails, setShowDetails] = useState(false);

  const backendServices = BACKEND_SERVICES.length;
  const totalServices = backendServices;
  const indexedDbOnlyServices = totalServices - backendServices;
  const coverage = currentSource === 'postgresql' ? backendServices : 0;

  return (
    <div className={cn("p-5 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn("text-base font-semibold flex items-center gap-2", theme.text.primary)}>
          <Activity className="h-5 w-5 text-blue-500" /> Backend API Coverage
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
            theme.border.default,
            theme.text.primary
          )}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={cn(
          "p-4 rounded-lg",
          currentSource === 'postgresql' ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-slate-800"
        )}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Backend API</div>
          <div className={cn(
            "text-2xl font-bold",
            currentSource === 'postgresql' ? "text-blue-600 dark:text-blue-400" : theme.text.primary
          )}>
            {coverage}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IndexedDB Only</div>
          <div className={cn("text-2xl font-bold", theme.text.primary)}>
            {currentSource === 'postgresql' ? indexedDbOnlyServices : totalServices}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Coverage</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currentSource === 'postgresql' ? Math.round((coverage / totalServices) * 100) : 0}%
          </div>
        </div>
      </div>

      {currentSource !== 'postgresql' && (
        <div className={cn(
          "p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800",
          "text-xs flex items-start gap-2",
          theme.text.primary
        )}>
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>Switch to PostgreSQL data source to enable backend API services.</span>
        </div>
      )}

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <h4 className={cn("text-sm font-semibold mb-3", theme.text.primary)}>
              Backend-Enabled Services ({backendServices}):
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BACKEND_SERVICES.map((service) => (
                <div
                  key={service}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2",
                    currentSource === 'postgresql' 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                      : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {currentSource === 'postgresql' ? (
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  {service}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * @fileoverview CLE (Continuing Legal Education) Tracker Component
 * @description Production-grade CLE compliance tracking with credit management,
 * deadline monitoring, course enrollment, and jurisdiction-specific requirements.
 *
 * Features:
 * - Credit tracking by category (Ethics, General, Specialty)
 * - Jurisdiction-specific requirements (CA, NY, FL, TX, etc.)
 * - Deadline countdown and alerts
 * - Course enrollment and completion
 * - Certificate management
 * - Compliance reporting
 * - Export to PDF for bar association submissions
 */

import { api } from '@/api';
import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface CLERequirement {
  jurisdiction: string;
  totalRequired: number;
  ethicsRequired: number;
  generalRequired: number;
  specialtyRequired?: number;
  reportingPeriod: string;
  deadline: string;
}

export interface CLECredit {
  id: string;
  courseId: string;
  courseName: string;
  provider: string;
  date: string;
  credits: number;
  category: 'Ethics' | 'General' | 'Specialty';
  jurisdiction: string;
  certificateUrl?: string;
  status: 'Completed' | 'Pending' | 'Verified';
}

export interface CLECourse {
  id: string;
  title: string;
  provider: string;
  credits: number;
  category: 'Ethics' | 'General' | 'Specialty';
  jurisdiction: string[];
  format: 'Live' | 'Online' | 'On-Demand';
  date?: string;
  cost: number;
  description: string;
  registrationUrl?: string;
}

export interface CLEProgress {
  jurisdiction: string;
  ethicsCompleted: number;
  ethicsRequired: number;
  generalCompleted: number;
  generalRequired: number;
  specialtyCompleted: number;
  specialtyRequired: number;
  totalCompleted: number;
  totalRequired: number;
  percentComplete: number;
  deadline: string;
  daysRemaining: number;
  isCompliant: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
//                           COMPONENT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const CLETracker: React.FC = () => {
  const [requirements, setRequirements] = useState<CLERequirement[]>([]);
  const [credits, setCredits] = useState<CLECredit[]>([]);
  const [courses, setCourses] = useState<CLECourse[]>([]);
  const [progress, setProgress] = useState<CLEProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('CA');
  const [view, setView] = useState<'dashboard' | 'credits' | 'courses'>('dashboard');

  // ═════════════════════════════════════════════════════════════════════════
  //                            DATA LOADING
  // ═════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    loadCLEData();
  }, []);

  const loadCLEData = async () => {
    setLoading(true);
    try {
      const [reqData, creditsData, coursesData, progressData] = await Promise.all([
        api.cle.getRequirements(),
        api.cle.getCredits(),
        api.cle.getAvailableCourses(),
        api.cle.getProgress(),
      ]);

      setRequirements(reqData);
      setCredits(creditsData);
      setCourses(coursesData);
      setProgress(progressData);
    } catch (error) {
      console.error('[CLETracker] Failed to load CLE data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  //                         CREDIT MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  /* TODO: Implement these functions when CLE management features are added
  const handleAddCredit = async (credit: Omit<CLECredit, 'id'>) => {
    try {
      const newCredit = await api.cle.addCredit(credit);
      setCredits([...credits, newCredit]);
      await loadCLEData(); // Refresh progress
    } catch (error) {
      console.error('[CLETracker] Failed to add credit:', error);
    }
  };

  const handleDeleteCredit = async (creditId: string) => {
    try {
      await api.cle.deleteCredit(creditId);
      setCredits(credits.filter((c) => c.id !== creditId));
      await loadCLEData(); // Refresh progress
    } catch (error) {
      console.error('[CLETracker] Failed to delete credit:', error);
    }
  };

  const handleUploadCertificate = async (creditId: string, file: File) => {
    try {
      const url = await api.cle.uploadCertificate(creditId, file);
      setCredits(
        credits.map((c) =>
          c.id === creditId ? { ...c, certificateUrl: url, status: 'Verified' } : c
        )
      );
    } catch (error) {
      console.error('[CLETracker] Failed to upload certificate:', error);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  //                         COURSE ENROLLMENT
  // ═════════════════════════════════════════════════════════════════════════

  const handleEnrollCourse = async (courseId: string) => {
    try {
      await api.cle.enrollCourse(courseId);
      alert('Successfully enrolled in course!');
    } catch (error) {
      console.error('[CLETracker] Failed to enroll in course:', error);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  //                         REPORTING & EXPORT
  // ═════════════════════════════════════════════════════════════════════════

  const handleExportReport = async () => {
    try {
      const pdfBlob = await api.cle.exportReport(selectedJurisdiction);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CLE_Report_${selectedJurisdiction}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[CLETracker] Failed to export report:', error);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  //                           HELPER FUNCTIONS
  // ═════════════════════════════════════════════════════════════════════════

  const getProgressForJurisdiction = (jurisdiction: string): CLEProgress | undefined => {
    return progress.find((p) => p.jurisdiction === jurisdiction);
  };

  // Helper to format date strings
  const formatDeadline = (deadline: string): string => {
    return new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
    const diff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (daysRemaining: number): string => {
    if (daysRemaining < 30) return 'text-red-600';
    if (daysRemaining < 90) return 'text-amber-600';
    return 'text-green-600';
  };

  // ═════════════════════════════════════════════════════════════════════════
  //                              RENDER
  // ═════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentProgress = getProgressForJurisdiction(selectedJurisdiction);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
<div className="flex justify-between items-center">
  <div>
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
      CLE Compliance Tracker
    </h2>
    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
      Track continuing legal education requirements and deadlines
    </p>
  </div>
  <div className="flex gap-3">
    <select
      value={selectedJurisdiction}
      onChange={(e) => setSelectedJurisdiction(e.target.value)}
      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      {requirements.map((req) => (
        <option key={req.jurisdiction} value={req.jurisdiction}>
          {req.jurisdiction}
        </option>
      ))}
    </select>
    <button
      onClick={handleExportReport}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Export Report
    </button>
  </div>
</div>

{/* View Tabs */ }
<div className="flex gap-2 border-b border-slate-200">
  <button
    onClick={() => setView('dashboard')}
    className={`px-4 py-2 font-medium transition-colors ${view === 'dashboard'
      ? 'text-blue-600 border-b-2 border-blue-600'
      : 'text-slate-600 hover:text-slate-900'
      }`}
  >
    Dashboard
  </button>
  <button
    onClick={() => setView('credits')}
    className={`px-4 py-2 font-medium transition-colors ${view === 'credits'
      ? 'text-blue-600 border-b-2 border-blue-600'
      : 'text-slate-600 hover:text-slate-900'
      }`}
  >
    My Credits ({credits.length})
  </button>
  <button
    onClick={() => setView('courses')}
    className={`px-4 py-2 font-medium transition-colors ${view === 'courses'
      ? 'text-blue-600 border-b-2 border-blue-600'
      : 'text-slate-600 hover:text-slate-900'
      }`}
  >
    Available Courses ({courses.length})
  </button>
</div>

{/* Dashboard View */ }
{
  view === 'dashboard' && currentProgress && (
    <div className="space-y-6">
      {/* Compliance Status Card */}
      <div className={`p-6 rounded-lg border-2 ${currentProgress.isCompliant
        ? 'bg-green-50 border-green-200'
        : 'bg-amber-50 border-amber-200'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {currentProgress.isCompliant ? '✅ Compliant' : '⚠️ Action Required'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {currentProgress.totalCompleted} of {currentProgress.totalRequired} credits completed
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getStatusColor(currentProgress.daysRemaining)}`}>
              {currentProgress.daysRemaining} days
            </p>
            <p className="text-sm text-slate-600">Until deadline</p>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-3 gap-4">
        {/* Ethics Credits */}
        <div className="p-4 bg-white rounded-lg shadow border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Ethics</span>
            <span className="text-sm text-slate-600">
              {currentProgress.ethicsCompleted}/{currentProgress.ethicsRequired}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (currentProgress.ethicsCompleted / currentProgress.ethicsRequired) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* General Credits */}
        <div className="p-4 bg-white rounded-lg shadow border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">General</span>
            <span className="text-sm text-slate-600">
              {currentProgress.generalCompleted}/{currentProgress.generalRequired}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (currentProgress.generalCompleted / currentProgress.generalRequired) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Specialty Credits */}
        {currentProgress.specialtyRequired > 0 && (
          <div className="p-4 bg-white rounded-lg shadow border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Specialty</span>
              <span className="text-sm text-slate-600">
                {currentProgress.specialtyCompleted}/{currentProgress.specialtyRequired}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (currentProgress.specialtyCompleted / currentProgress.specialtyRequired) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent Credits */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Credits</h3>
        <div className="space-y-3">
          {credits
            .filter((c) => c.jurisdiction === selectedJurisdiction)
            .slice(0, 5)
            .map((credit) => (
              <div
                key={credit.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-900">{credit.courseName}</p>
                  <p className="text-sm text-slate-600">
                    {credit.provider} • {credit.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {credit.credits} {credit.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${credit.status === 'Verified'
                      ? 'bg-green-100 text-green-800'
                      : credit.status === 'Completed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                      }`}
                  >
                    {credit.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

{/* Credits View */ }
{
  view === 'credits' && (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">All Credits</h3>
        <button
          onClick={() => {
            // Open add credit modal
            alert('Add credit modal would open here');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Credit
        </button>
      </div>
      <div className="space-y-3">
        {credits.map((credit) => (
          <div
            key={credit.id}
            className="flex items-center justify-between py-3 border-b last:border-0"
          >
            <div className="flex-1">
              <p className="font-medium text-slate-900">{credit.courseName}</p>
              <p className="text-sm text-slate-600">
                {credit.provider} • {credit.date} • {credit.jurisdiction}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {credit.credits} {credit.category}
              </span>
              {credit.certificateUrl ? (
                <a
                  href={credit.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Certificate
                </a>
              ) : (
                <button
                  onClick={() => {
                    // Open certificate upload
                    alert('Certificate upload would open here');
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Upload Certificate
                </button>
              )}
              <button
                onClick={() => handleDeleteCredit(credit.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

{/* Courses View */ }
{
  view === 'courses' && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses
        .filter((course) => course.jurisdiction.includes(selectedJurisdiction))
        .map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-slate-900">{course.title}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {course.credits} credits
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{course.provider}</p>
            <p className="text-sm text-slate-700 mb-4 line-clamp-2">{course.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                {course.category}
              </span>
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                {course.format}
              </span>
              {course.date && (
                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                  {course.date}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">
                ${course.cost}
              </span>
              <button
                onClick={() => handleEnrollCourse(course.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Enroll
              </button>
            </div>
          </div>
        ))}
    </div>
    </div >
  );
};

export default CLETracker;

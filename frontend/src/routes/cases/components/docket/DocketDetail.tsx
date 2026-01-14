import { TabNavigation } from '@/shared/ui/organisms/TabNavigation/TabNavigation';
import { format } from 'date-fns';
import { Database, FileText, Layout, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form, useFetcher, useNavigate } from 'react-router';

// Helper function
function setDeepValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(/[.[\]]/).filter(Boolean);
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i] as string;
    if (!current[key]) {
      const nextKey = parts[i + 1] as string;
      current[key] = isNaN(Number(nextKey)) ? {} : [];
    }
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1] as string] = value;
}

// Editable Field Component
function EditableMetadataField({
  label,
  value,
  path,
  onSave,
  className,
  hideLabel = false,
  multiline = false
}: {
  label: string,
  value?: string | number | null,
  path: string,
  onSave: (path: string, val: string) => void,
  className?: string,
  hideLabel?: boolean,
  multiline?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value?.toString() || '');

  useEffect(() => {
    setCurrentValue(value?.toString() || '');
  }, [value]);

  const handleSave = () => {
    setIsEditing(false);
    if (currentValue !== (value?.toString() || '')) {
      onSave(path, currentValue);
    }
  };

  return (
    <div className="group w-full">
      {!hideLabel && <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 select-none pb-1">{label}</dt>}
      {isEditing ? (
        multiline ? (
          <textarea
            autoFocus
            className="w-full text-sm p-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsEditing(false);
                setCurrentValue(value?.toString() || '');
              }
            }}
          />
        ) : (
          <input
            autoFocus
            type="text"
            className="w-full text-sm p-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setCurrentValue(value?.toString() || '');
              }
            }}
          />
        )
      ) : (
        <dd
          onClick={() => setIsEditing(true)}
          className={`mt-1 break-words cursor-pointer min-h-[1.5em] rounded hover:bg-gray-100 dark:hover:bg-gray-700 px-1 -ml-1 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 ${multiline ? 'whitespace-pre-wrap' : ''} ${className || 'text-sm text-gray-900 dark:text-gray-100'}`}
          title={`Click to edit ${label}`}
        >
          {value || <span className="text-gray-400 italic">Empty</span>}
        </dd>
      )}
    </div>
  );
}


interface Attorney {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  name?: string;
  noticeInfo?: string;
  title?: string;
  type?: string;
  office?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  businessPhone?: string;
  email?: string;
  fax?: string;
  terminationDate?: string;
  [key: string]: unknown;
}

interface Party {
  name?: string;
  type?: string;
  prisonerNumber?: string;
  partyText?: string;
  alias?: string;
  dateTerminated?: string;
  attorneys?: Attorney[];
  [key: string]: unknown;
}

interface AssociatedCase {
  caseNumber?: string;
  associatedType?: string;
  status?: string;
  shortTitle?: string;
  dateStart?: string;
  dateEnd?: string;
  leadCaseNumber?: string;
  memberCaseNumber?: string;
  [key: string]: unknown;
}

interface PriorCase {
  caseNumber?: string;
  dateFiled?: string;
  dateDisposed?: string;
  disposition?: string;
  [key: string]: unknown;
}

interface AppellateData {
  caseQuery?: {
    associatedCases?: AssociatedCase[];
    parties?: Party[];
    originatingCase?: {
      leadCaseNumber?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  fullDocket?: {
    priorCases?: PriorCase[];
    caption?: string;
    panel?: {
      panelType?: string;
      enbanc?: boolean;
      dateHearing?: string;
      dateComplete?: string;
      dateDecision?: string;
      panelists?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  caseSummary?: {
    stub?: {
      natureOfSuit?: string;
      caseType?: string;
      subType?: string;
      origCourt?: string;
      [key: string]: unknown;
    };
    originatingCourt?: {
      dateDecided?: string;
      dateRecdCoa?: string;
      dateSentence?: string;
      district?: string;
      division?: string;
      [key: string]: unknown;
    };
    originatingPerson?: {
      firstName?: string;
      lastName?: string;
      role?: string;
      title?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface DocketDetailProps {
  initialItem: Record<string, unknown>; // Using strict Record type
}

export function DocketDetail({ initialItem }: DocketDetailProps) {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [activeTab, setActiveTab] = useState('entry');
  const [isEditing, setIsEditing] = useState(false);

  // Optimistic UI: Use fetcher.formData if available, else item
  const item = fetcher.formData
    ? { ...initialItem, appellateData: JSON.parse(fetcher.formData.get("appellateData") as string) }
    : initialItem;

  const handleMetadataUpdate = (path: string, value: string) => {
    // Clone current effective data to build the new state
    const newAppellateData = JSON.parse(JSON.stringify(item.appellateData || {}));
    // Update the specific field
    setDeepValue(newAppellateData, path, value);

    // Submit via fetcher - this triggers the action and then auto-revalidates
    fetcher.submit(
      {
        intent: "update-metadata",
        appellateData: JSON.stringify(newAppellateData)
      },
      { method: "post" }
    );
  };

  // Tabs configuration
  const tabs = [
    { id: 'entry', label: 'Entry Details', icon: FileText },
    { id: 'metadata', label: 'Case Metadata', icon: Database },
    { id: 'parties', label: 'Parties & Attorneys', icon: Users },
    { id: 'full', label: 'Full Docket Report', icon: Layout },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {item.title || item.description}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Filed: {item.dateFiled ? format(new Date(item.dateFiled), 'PPP') : 'N/A'}</span>
            <span>•</span>
            <span>Type: {item.type}</span>
            {item.docketNumber && (
              <>
                <span>•</span>
                <span>Docket #: {item.docketNumber}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {item.documentUrl && (
            <a
              href={item.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Document
            </a>
          )}
        </div>
      </div>

      <div className="mb-6">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-6"
        />
      </div>

      {activeTab === 'entry' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Metadata</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Filed By</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.filedBy || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sequence Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.sequenceNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.isSealed ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                      {item.isSealed ? 'Sealed' : 'Public'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Filing Content & Editor */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex justify-between items-center">
                Filing Content
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </button>
                )}
              </h3>

              {isEditing ? (
                <Form method="post" onSubmit={() => setIsEditing(false)}>
                  <input type="hidden" name="intent" value="update-content" />
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Text</label>
                      <textarea
                        name="text"
                        defaultValue={item.text}
                        rows={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter the full text of the document here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attach PDF</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500 dark:bg-gray-800">
                              <span>Upload a file</span>
                              <input id="file-upload" name="file" type="file" className="sr-only" accept=".pdf,.doc,.docx" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        Save Content
                      </button>
                    </div>
                  </div>
                </Form>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {item.text ? (
                    <p className="whitespace-pre-wrap">{item.text}</p>
                  ) : (
                    <p className="italic text-gray-500 dark:text-gray-400">No content available. Click edit to add text or attach files.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Related Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                  Add Note
                </button>
                <button className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-600">
                  Set Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Case Selection Data */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Case Selection Data</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <EditableMetadataField label="Case Number" value={item.appellateData?.caseSelection?.caseNumber} path="caseSelection.caseNumber" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Short Title" value={item.appellateData?.caseSelection?.shortTitle} path="caseSelection.shortTitle" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Filed" value={item.appellateData?.caseSelection?.dateFiled} path="caseSelection.dateFiled" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Last Entry" value={item.appellateData?.caseSelection?.dateLastDocketEntry} path="caseSelection.dateLastDocketEntry" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Originating Case #" value={item.appellateData?.caseSelection?.origCaseNumber} path="caseSelection.origCaseNumber" onSave={handleMetadataUpdate} />
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Originating Link</dt>
                <dd className="mt-1 text-sm text-blue-600 truncate">
                  {item.appellateData?.caseSelection?.origCaseLink ? <a href={item.appellateData.caseSelection.origCaseLink} target="_blank" rel="noreferrer">{item.appellateData.caseSelection.origCaseLink}</a> : '-'}
                </dd>
              </div>
              <EditableMetadataField label="Nature of Suit" value={item.appellateData?.caseSelection?.natureOfSuit} path="caseSelection.natureOfSuit" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Type" value={item.appellateData?.caseSelection?.type} path="caseSelection.type" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Status" value={item.appellateData?.caseSelection?.status} path="caseSelection.status" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Terminated" value={item.appellateData?.caseSelection?.dateTerminated} path="caseSelection.dateTerminated" onSave={handleMetadataUpdate} />
            </dl>
          </div>

          {/* Case Query Data - Originating Case */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Originating Case Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <EditableMetadataField label="Judge" value={item.appellateData?.caseQuery?.originatingCase?.judge} path="caseQuery.originatingCase.judge" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Court Reporter" value={item.appellateData?.caseQuery?.originatingCase?.courtReporter} path="caseQuery.originatingCase.courtReporter" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Judgment" value={item.appellateData?.caseQuery?.originatingCase?.dateJudgment} path="caseQuery.originatingCase.dateJudgment" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date NOA Filed" value={item.appellateData?.caseQuery?.originatingCase?.dateNOAFiled} path="caseQuery.originatingCase.dateNOAFiled" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Execution" value={item.appellateData?.caseQuery?.originatingCase?.dateExecution} path="caseQuery.originatingCase.dateExecution" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Lead Case #" value={item.appellateData?.caseQuery?.originatingCase?.leadCaseNumber} path="caseQuery.originatingCase.leadCaseNumber" onSave={handleMetadataUpdate} />
            </dl>
          </div>

          {/* Associated Cases */}
          <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Associated Cases</h3>
            {(item.appellateData as unknown as AppellateData)?.caseQuery?.associatedCases?.map((associated, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <EditableMetadataField label="Case Number" value={associated.caseNumber} path={`caseQuery.associatedCases[${idx}].caseNumber`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Type" value={associated.associatedType} path={`caseQuery.associatedCases[${idx}].associatedType`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Status" value={associated.status} path={`caseQuery.associatedCases[${idx}].status`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Short Title" value={associated.shortTitle} path={`caseQuery.associatedCases[${idx}].shortTitle`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Date Start" value={associated.dateStart} path={`caseQuery.associatedCases[${idx}].dateStart`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Date End" value={associated.dateEnd} path={`caseQuery.associatedCases[${idx}].dateEnd`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Lead Case #" value={associated.leadCaseNumber} path={`caseQuery.associatedCases[${idx}].leadCaseNumber`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Member Case #" value={associated.memberCaseNumber} path={`caseQuery.associatedCases[${idx}].memberCaseNumber`} onSave={handleMetadataUpdate} />
                </div>
              </div>
            ))}
            {(!item.appellateData?.caseQuery?.associatedCases || item.appellateData.caseQuery.associatedCases.length === 0) && (
              <p className="text-sm text-gray-500 italic">No associated cases found.</p>
            )}
          </div>

          {/* Case Summary Additional Fields */}
          <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Case Summary Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
              <EditableMetadataField label="Nature of Suit" value={item.appellateData?.caseSummary?.stub?.natureOfSuit} path="caseSummary.stub.natureOfSuit" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Case Type" value={item.appellateData?.caseSummary?.stub?.caseType} path="caseSummary.stub.caseType" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Sub-Type" value={item.appellateData?.caseSummary?.stub?.subType} path="caseSummary.stub.subType" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Decided" value={item.appellateData?.caseSummary?.originatingCourt?.dateDecided} path="caseSummary.originatingCourt.dateDecided" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Rec'd COA" value={item.appellateData?.caseSummary?.originatingCourt?.dateRecdCoa} path="caseSummary.originatingCourt.dateRecdCoa" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Sentence" value={item.appellateData?.caseSummary?.originatingCourt?.dateSentence} path="caseSummary.originatingCourt.dateSentence" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Originating Court" value={item.appellateData?.caseSummary?.stub?.origCourt} path="caseSummary.stub.origCourt" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="District" value={item.appellateData?.caseSummary?.originatingCourt?.district} path="caseSummary.originatingCourt.district" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Division" value={item.appellateData?.caseSummary?.originatingCourt?.division} path="caseSummary.originatingCourt.division" onSave={handleMetadataUpdate} />
            </dl>
            {item.appellateData?.caseSummary?.originatingPerson && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Originating Person</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <EditableMetadataField label="First Name" value={item.appellateData.caseSummary.originatingPerson.firstName} path="caseSummary.originatingPerson.firstName" onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Last Name" value={item.appellateData.caseSummary.originatingPerson.lastName} path="caseSummary.originatingPerson.lastName" onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Role" value={item.appellateData.caseSummary.originatingPerson.role} path="caseSummary.originatingPerson.role" onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Title" value={item.appellateData.caseSummary.originatingPerson.title} path="caseSummary.originatingPerson.title" onSave={handleMetadataUpdate} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'parties' && (
        <div className="space-y-6">
          {((item.appellateData as unknown as AppellateData)?.caseQuery?.parties || []).map((party, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex justify-between items-start mb-4 border-b pb-2">
                <div className="flex-1 space-y-2">
                  <EditableMetadataField label="Name" value={party.name} path={`caseQuery.parties[${idx}].name`} onSave={handleMetadataUpdate} className="text-lg font-bold text-gray-900 dark:text-gray-100" hideLabel />
                  <div className="flex flex-wrap gap-2 items-center">
                    <EditableMetadataField label="Type" value={party.type} path={`caseQuery.parties[${idx}].type`} onSave={handleMetadataUpdate} className="text-sm text-gray-500" hideLabel />
                    <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-2 rounded dark:bg-gray-700">
                      <span className="mr-2 text-xs uppercase font-semibold">Prisoner #</span>
                      <EditableMetadataField label="Prisoner Number" value={party.prisonerNumber} path={`caseQuery.parties[${idx}].prisonerNumber`} onSave={handleMetadataUpdate} hideLabel />
                    </div>
                  </div>
                  <EditableMetadataField label="Party Text" value={party.partyText} path={`caseQuery.parties[${idx}].partyText`} onSave={handleMetadataUpdate} className="text-sm text-gray-600 italic dark:text-gray-400" hideLabel />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Alias:</span>
                    <EditableMetadataField label="Alias" value={party.alias} path={`caseQuery.parties[${idx}].alias`} onSave={handleMetadataUpdate} className="text-xs text-gray-400" hideLabel />
                  </div>
                </div>
                <div className="ml-4">
                  <EditableMetadataField label="Date Terminated - MM/DD/YYYY" value={party.dateTerminated} path={`caseQuery.parties[${idx}].dateTerminated`} onSave={handleMetadataUpdate} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded dark:bg-red-900 dark:text-red-100" />
                </div>
              </div>

              <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-semibold uppercase text-gray-500 mb-3">Attorneys</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {(party.attorneys || []).map((attorney, aIdx) => (
                    <div key={aIdx} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex gap-1 font-medium text-blue-700 dark:text-blue-400">
                            <EditableMetadataField label="First" value={attorney.firstName} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].firstName`} onSave={handleMetadataUpdate} hideLabel />
                            <EditableMetadataField label="Middle" value={attorney.middleName} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].middleName`} onSave={handleMetadataUpdate} hideLabel />
                            <EditableMetadataField label="Last" value={attorney.lastName} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].lastName`} onSave={handleMetadataUpdate} hideLabel />
                          </div>
                          <EditableMetadataField label="Full Name (Fallback)" value={attorney.name} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].name`} onSave={handleMetadataUpdate} className="text-xs text-gray-500" hideLabel />
                        </div>
                        <EditableMetadataField label="Notice Info" value={attorney.noticeInfo} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].noticeInfo`} onSave={handleMetadataUpdate} className="text-[10px] border border-gray-300 px-1 rounded dark:border-gray-600" hideLabel />
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500 mb-2 border-b border-gray-200 pb-2 dark:border-gray-600">
                        <EditableMetadataField label="Title" value={attorney.title} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].title`} onSave={handleMetadataUpdate} hideLabel className="italic" />
                        <span>•</span>
                        <EditableMetadataField label="Type" value={attorney.type} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].type`} onSave={handleMetadataUpdate} hideLabel />
                      </div>

                      <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        <EditableMetadataField label="Firm/Office" value={attorney.office} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].office`} onSave={handleMetadataUpdate} className="text-xs font-semibold text-gray-600 dark:text-gray-400" hideLabel />
                        <EditableMetadataField label="Address 1" value={attorney.address1} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].address1`} onSave={handleMetadataUpdate} hideLabel />
                        <EditableMetadataField label="Address 2" value={attorney.address2} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].address2`} onSave={handleMetadataUpdate} hideLabel />
                        <div className="flex gap-1 items-center">
                          <EditableMetadataField label="City" value={attorney.city} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].city`} onSave={handleMetadataUpdate} hideLabel />,
                          <EditableMetadataField label="State" value={attorney.state} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].state`} onSave={handleMetadataUpdate} hideLabel />
                          <EditableMetadataField label="Zip" value={attorney.zip} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].zip`} onSave={handleMetadataUpdate} hideLabel />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <EditableMetadataField label="Bus Phone" value={attorney.businessPhone} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].businessPhone`} onSave={handleMetadataUpdate} />
                          <EditableMetadataField label="Email" value={attorney.email} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].email`} onSave={handleMetadataUpdate} />
                          <EditableMetadataField label="Fax" value={attorney.fax} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].fax`} onSave={handleMetadataUpdate} />
                          <EditableMetadataField label="Terminated" value={attorney.terminationDate} path={`caseQuery.parties[${idx}].attorneys[${aIdx}].terminationDate`} onSave={handleMetadataUpdate} className="text-red-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {(!item.appellateData?.caseQuery?.parties || item.appellateData.caseQuery.parties.length === 0) && (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 italic">No party information available.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'full' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Case Caption</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border font-mono text-sm whitespace-pre-wrap">
              <EditableMetadataField label="Caption" value={item.appellateData?.fullDocket?.caption} path="fullDocket.caption" onSave={handleMetadataUpdate} multiline hideLabel />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Panel Information</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
              <EditableMetadataField label="Panel Type" value={item.appellateData?.fullDocket?.panel?.panelType} path="fullDocket.panel.panelType" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="En Banc" value={item.appellateData?.fullDocket?.panel?.enbanc ? 'Yes' : 'No'} path="fullDocket.panel.enbanc" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Hearing Date" value={item.appellateData?.fullDocket?.panel?.dateHearing} path="fullDocket.panel.dateHearing" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Complete" value={item.appellateData?.fullDocket?.panel?.dateComplete} path="fullDocket.panel.dateComplete" onSave={handleMetadataUpdate} />
              <EditableMetadataField label="Date Decision" value={item.appellateData?.fullDocket?.panel?.dateDecision} path="fullDocket.panel.dateDecision" onSave={handleMetadataUpdate} />
              <div className="sm:col-span-3">
                <EditableMetadataField label="Panelists" value={item.appellateData?.fullDocket?.panel?.panelists} path="fullDocket.panel.panelists" onSave={handleMetadataUpdate} multiline />
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Prior Cases</h3>
            {(item.appellateData as unknown as AppellateData)?.fullDocket?.priorCases?.map((prior, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <EditableMetadataField label="Case Number" value={prior.caseNumber} path={`fullDocket.priorCases[${idx}].caseNumber`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Date Filed" value={prior.dateFiled} path={`fullDocket.priorCases[${idx}].dateFiled`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Date Disposed" value={prior.dateDisposed} path={`fullDocket.priorCases[${idx}].dateDisposed`} onSave={handleMetadataUpdate} />
                  <EditableMetadataField label="Disposition" value={prior.disposition} path={`fullDocket.priorCases[${idx}].disposition`} onSave={handleMetadataUpdate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

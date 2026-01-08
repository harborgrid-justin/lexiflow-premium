/**
 * Document Review Loading State
 */

import { Card, CardBody, SkeletonLine } from '@/components/ui';

export default function ReviewLoading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 pb-4">
        <SkeletonLine lines={1} className="h-4 w-32 mb-4" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <SkeletonLine lines={1} className="h-8 w-64 mb-2" />
            <SkeletonLine lines={1} className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-4">
            <SkeletonLine lines={1} className="h-10 w-48" />
            <SkeletonLine lines={1} className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Workspace Skeleton */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">
        {/* Document List */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardBody className="p-4">
              <SkeletonLine lines={1} className="h-10 mb-4" />
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <SkeletonLine key={i} lines={1} className="h-16" />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Document Viewer */}
        <div className="col-span-6">
          <Card className="h-full">
            <CardBody className="p-4">
              <SkeletonLine lines={1} className="h-10 mb-4" />
              <SkeletonLine lines={1} className="h-[500px]" />
            </CardBody>
          </Card>
        </div>

        {/* Coding Panel */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardBody className="p-4">
              <SkeletonLine lines={1} className="h-10 mb-4" />
              <div className="space-y-4">
                <SkeletonLine lines={1} className="h-24" />
                <SkeletonLine lines={1} className="h-32" />
                <SkeletonLine lines={1} className="h-20" />
                <SkeletonLine lines={1} className="h-24" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

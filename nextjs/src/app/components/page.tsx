'use client';

/**
 * Component Showcase Page - Shows all available UI components
 * Useful for reference and testing during development
 */

import { PageHeader } from '@/components/layout';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  StatCard,
  Table,
  Tabs,
} from '@/components/ui';
import { Heart, Zap } from 'lucide-react';
import { useState } from 'react';

export default function ComponentShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');
  const [selectedSelect, setSelectedSelect] = useState<string | number>('option1');

  const tableData = [
    { id: '1', name: 'John Doe', role: 'Senior Attorney', status: 'Active' },
    { id: '2', name: 'Jane Smith', role: 'Paralegal', status: 'Active' },
    { id: '3', name: 'Bob Johnson', role: 'Attorney', status: 'Inactive' },
  ];

  const tableColumns = [
    { header: 'Name', accessor: 'name' as const },
    { header: 'Role', accessor: 'role' as const },
    { header: 'Status', accessor: 'status' as const },
  ];

  return (
    <>
      <PageHeader
        title="Component Showcase"
        description="Reference guide for all available UI components"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Components' },
        ]}
      />

      <Tabs
        tabs={[
          { label: 'Buttons', id: 'buttons' },
          { label: 'Cards', id: 'cards' },
          { label: 'Forms', id: 'forms' },
          { label: 'Feedback', id: 'feedback' },
          { label: 'Data Display', id: 'data' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* Buttons Tab */}
        {activeTab === 'buttons' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Button Variants</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Button Sizes</h3>
              </CardHeader>
              <CardBody>
                <div className="flex gap-4 flex-wrap">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Button States</h3>
              </CardHeader>
              <CardBody>
                <div className="flex gap-4 flex-wrap">
                  <Button loading>Loading</Button>
                  <Button fullWidth>Full Width</Button>
                  <Button icon={<Zap className="h-4 w-4" />}>With Icon</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Basic Card</h3>
              </CardHeader>
              <CardBody>
                <p>This is a card body with some content.</p>
              </CardBody>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Action
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Cases"
                value="48"
                subtitle="Active and pending"
                trend="up"
                trendValue="+12"
              />
              <StatCard
                title="Billable Hours"
                value="124.5h"
                subtitle="This month"
                trend="down"
                trendValue="-8.5h"
              />
              <StatCard
                title="Documents"
                value="1,234"
                subtitle="Total uploaded"
                trend="up"
                trendValue="+156"
              />
            </div>
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <Card>
            <CardBody className="space-y-6 max-w-md">
              <Input
                label="Full Name"
                placeholder="Enter your name"
                type="text"
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                error="Invalid email address"
              />

              <Input
                label="Message"
                placeholder="Enter your message"
                helperText="This is a helper text"
              />

              <Select
                label="Select an option"
                value={selectedSelect}
                onChange={setSelectedSelect}
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
              />

              <div className="flex gap-3">
                <Button>Submit</Button>
                <Button variant="secondary">Cancel</Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <Alert variant="success" title="Success" closeable>
              Your changes have been saved successfully.
            </Alert>

            <Alert variant="error" title="Error" closeable>
              Something went wrong. Please try again.
            </Alert>

            <Alert variant="warning" title="Warning" closeable>
              This action cannot be undone.
            </Alert>

            <Alert variant="info" title="Information" closeable>
              Your subscription will renew on December 31, 2025.
            </Alert>

            <Card>
              <CardBody>
                <Button onClick={() => setIsModalOpen(true)} className="mb-4">
                  Open Modal
                </Button>
              </CardBody>
            </Card>

            <Modal
              isOpen={isModalOpen}
              title="Confirm Action"
              onClose={() => setIsModalOpen(false)}
              footer={
                <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Confirm</Button>
                </>
              }
            >
              <p>Are you sure you want to proceed with this action?</p>
            </Modal>
          </div>
        )}

        {/* Data Display Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Badges</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary" size="sm">
                    Small
                  </Badge>
                  <Badge variant="primary" size="md">
                    Medium
                  </Badge>
                  <Badge variant="primary" size="lg">
                    Large
                  </Badge>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Table</h3>
              </CardHeader>
              <CardBody className="p-0">
                <Table columns={tableColumns} data={tableData} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Empty State</h3>
              </CardHeader>
              <CardBody>
                <EmptyState
                  icon={<Heart className="h-12 w-12 text-slate-400" />}
                  title="No items found"
                  description="Create a new item to get started"
                  action={<Button size="sm">Create Item</Button>}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Loading Skeleton</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardBody>
            </Card>
          </div>
        )}
      </Tabs>
    </>
  );
}

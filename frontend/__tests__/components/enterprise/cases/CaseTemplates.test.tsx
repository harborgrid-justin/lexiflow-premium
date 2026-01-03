/**
 * CaseTemplates.test.tsx
 * Comprehensive tests for Case Templates component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseTemplates } from '@/components/enterprise/CaseManagement/CaseTemplates';
import { CaseTemplate, PracticeArea } from '@/components/enterprise/CaseManagement/CaseTemplates';
import { MatterType, CaseStatus } from '@/types';

// Mock templates
const mockTemplates: CaseTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Civil Litigation - Breach of Contract',
    description: 'Standard template for breach of contract cases',
    practiceArea: 'Litigation' as PracticeArea,
    matterType: MatterType.LITIGATION,
    icon: () => null,
    fields: [
      { id: 'contractDate', label: 'Contract Date', type: 'date', required: true },
      { id: 'damagesAmount', label: 'Damages Claimed', type: 'number', required: true },
    ],
    defaultValues: {
      status: CaseStatus.PreFiling,
      practiceArea: 'Litigation',
    },
    checklist: [
      { id: 'cl-1', title: 'Obtain and review contract', order: 1, dueInDays: 3 },
      { id: 'cl-2', title: 'Interview client', order: 2, dueInDays: 5 },
    ],
    documents: [
      { id: 'doc-1', name: 'Complaint', type: 'pleading', required: true },
      { id: 'doc-2', name: 'Summons', type: 'pleading', required: true },
    ],
    milestones: [
      { id: 'ms-1', name: 'Case Intake Complete', daysFromStart: 7 },
      { id: 'ms-2', name: 'Demand Letter Sent', daysFromStart: 30 },
    ],
    estimatedDuration: 365,
    estimatedBudget: 50000,
    usageCount: 24,
  },
  {
    id: 'tpl-2',
    name: 'Corporate Formation',
    description: 'Template for forming new corporations and LLCs',
    practiceArea: 'Corporate' as PracticeArea,
    matterType: MatterType.TRANSACTIONAL,
    icon: () => null,
    fields: [
      { id: 'entityType', label: 'Entity Type', type: 'select', required: true, options: ['C-Corp', 'LLC'] },
    ],
    defaultValues: {
      status: CaseStatus.Active,
      practiceArea: 'Corporate',
    },
    checklist: [
      { id: 'cl-1', title: 'Client consultation', order: 1, dueInDays: 1 },
    ],
    documents: [
      { id: 'doc-1', name: 'Articles of Incorporation', type: 'form', required: true },
    ],
    milestones: [
      { id: 'ms-1', name: 'Formation Documents Filed', daysFromStart: 7 },
    ],
    estimatedDuration: 30,
    estimatedBudget: 5000,
    usageCount: 18,
  },
  {
    id: 'tpl-3',
    name: 'Real Estate Purchase/Sale',
    description: 'Template for residential and commercial real estate transactions',
    practiceArea: 'Real Estate' as PracticeArea,
    matterType: MatterType.TRANSACTIONAL,
    icon: () => null,
    fields: [
      { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
      { id: 'purchasePrice', label: 'Purchase Price', type: 'number', required: true },
    ],
    defaultValues: {
      status: CaseStatus.Active,
      practiceArea: 'Real Estate',
    },
    checklist: [
      { id: 'cl-1', title: 'Review purchase agreement', order: 1, dueInDays: 1 },
    ],
    documents: [
      { id: 'doc-1', name: 'Purchase Agreement', type: 'contract', required: true },
    ],
    milestones: [
      { id: 'ms-1', name: 'Contract Signed', daysFromStart: 1 },
    ],
    estimatedDuration: 30,
    estimatedBudget: 3000,
    usageCount: 31,
  },
];

describe('CaseTemplates', () => {
  const defaultProps = {
    templates: mockTemplates,
    onCreateFromTemplate: jest.fn(),
    onEditTemplate: jest.fn(),
    onDeleteTemplate: jest.fn(),
    onCloneTemplate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Listing', () => {
    it('should render all templates', () => {
      render(<CaseTemplates {...defaultProps} />);

      expect(screen.getByText('Civil Litigation - Breach of Contract')).toBeInTheDocument();
      expect(screen.getByText('Corporate Formation')).toBeInTheDocument();
      expect(screen.getByText('Real Estate Purchase/Sale')).toBeInTheDocument();
    });

    it('should display template descriptions', () => {
      render(<CaseTemplates {...defaultProps} />);

      expect(screen.getByText('Standard template for breach of contract cases')).toBeInTheDocument();
      expect(screen.getByText('Template for forming new corporations and LLCs')).toBeInTheDocument();
    });

    it('should display template metadata', () => {
      render(<CaseTemplates {...defaultProps} />);

      // Check for checklist count
      expect(screen.getByText('2 tasks')).toBeInTheDocument();

      // Check for usage count
      expect(screen.getByText('Used 24 times')).toBeInTheDocument();
      expect(screen.getByText('Used 18 times')).toBeInTheDocument();

      // Check for estimated duration (multiple templates may have same duration)
      expect(screen.getByText('~365 days')).toBeInTheDocument();
      expect(screen.getAllByText('~30 days').length).toBeGreaterThan(0);
    });

    it('should display estimated budget', () => {
      render(<CaseTemplates {...defaultProps} />);

      expect(screen.getByText('$50k')).toBeInTheDocument();
      expect(screen.getByText('$5k')).toBeInTheDocument();
      expect(screen.getByText('$3k')).toBeInTheDocument();
    });

    it('should display practice area labels', () => {
      render(<CaseTemplates {...defaultProps} />);

      const templates = screen.getAllByText(/Litigation|Corporate|Real Estate/);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('Template Search', () => {
    it('should filter templates by name', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await userEvent.type(searchInput, 'Corporate');

      await waitFor(() => {
        expect(screen.getByText('Corporate Formation')).toBeInTheDocument();
        expect(screen.queryByText('Civil Litigation - Breach of Contract')).not.toBeInTheDocument();
      });
    });

    it('should filter templates by description', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await userEvent.type(searchInput, 'corporations');

      await waitFor(() => {
        expect(screen.getByText('Corporate Formation')).toBeInTheDocument();
        expect(screen.queryByText('Real Estate Purchase/Sale')).not.toBeInTheDocument();
      });
    });

    it('should filter templates by practice area in search', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await userEvent.type(searchInput, 'Real Estate');

      await waitFor(() => {
        expect(screen.getByText('Real Estate Purchase/Sale')).toBeInTheDocument();
        expect(screen.queryByText('Corporate Formation')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when no templates match search', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await userEvent.type(searchInput, 'NonexistentTemplate');

      await waitFor(() => {
        expect(screen.getByText('No templates found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your search or filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Practice Area Filtering', () => {
    it('should filter templates by Litigation practice area', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const litigationButton = screen.getByRole('button', { name: /^Litigation$/i });
      await userEvent.click(litigationButton);

      await waitFor(() => {
        expect(screen.getByText('Civil Litigation - Breach of Contract')).toBeInTheDocument();
        expect(screen.queryByText('Corporate Formation')).not.toBeInTheDocument();
      });
    });

    it('should filter templates by Corporate practice area', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const corporateButton = screen.getByRole('button', { name: /^Corporate$/i });
      await userEvent.click(corporateButton);

      await waitFor(() => {
        expect(screen.getByText('Corporate Formation')).toBeInTheDocument();
        expect(screen.queryByText('Real Estate Purchase/Sale')).not.toBeInTheDocument();
      });
    });

    it('should show all templates when All filter selected', async () => {
      render(<CaseTemplates {...defaultProps} />);

      // First filter by Corporate
      const corporateButton = screen.getByRole('button', { name: /^Corporate$/i });
      await userEvent.click(corporateButton);

      // Then click All
      const allButton = screen.getByRole('button', { name: /^All$/i });
      await userEvent.click(allButton);

      await waitFor(() => {
        expect(screen.getByText('Civil Litigation - Breach of Contract')).toBeInTheDocument();
        expect(screen.getByText('Corporate Formation')).toBeInTheDocument();
        expect(screen.getByText('Real Estate Purchase/Sale')).toBeInTheDocument();
      });
    });

    it('should highlight active practice area filter', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const litigationButton = screen.getByRole('button', { name: /^Litigation$/i });
      await userEvent.click(litigationButton);

      await waitFor(() => {
        expect(litigationButton).toHaveClass(/bg-blue-600/);
      });
    });
  });

  describe('Template Selection', () => {
    it('should open template detail modal when template clicked', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Corporate Formation');
      await userEvent.click(template);

      await waitFor(() => {
        // Modal should show template details
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText(/Checklist/i)).toBeInTheDocument();
      });
    });

    it('should display template checklist in detail modal', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Civil Litigation - Breach of Contract');
      await userEvent.click(template);

      await waitFor(() => {
        expect(screen.getByText('Obtain and review contract')).toBeInTheDocument();
        expect(screen.getByText('Interview client')).toBeInTheDocument();
        expect(screen.getByText('Due in 3 days')).toBeInTheDocument();
      });
    });

    it('should display required documents in detail modal', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Civil Litigation - Breach of Contract');
      await userEvent.click(template);

      await waitFor(() => {
        expect(screen.getByText('Complaint')).toBeInTheDocument();
        expect(screen.getByText('Summons')).toBeInTheDocument();
        expect(screen.getAllByText('Required').length).toBeGreaterThan(0);
      });
    });

    it('should display milestones in detail modal', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Civil Litigation - Breach of Contract');
      await userEvent.click(template);

      await waitFor(() => {
        expect(screen.getByText('Case Intake Complete')).toBeInTheDocument();
        expect(screen.getByText('Demand Letter Sent')).toBeInTheDocument();
        expect(screen.getByText('Day 7')).toBeInTheDocument();
        expect(screen.getByText('Day 30')).toBeInTheDocument();
      });
    });

    it('should close modal when X button clicked', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Corporate Formation');
      await userEvent.click(template);

      // Wait for modal to open and find X close button (has X icon but no accessible name)
      await waitFor(() => {
        expect(screen.getByText('Description')).toBeInTheDocument();
      });

      // Find the X close button by looking for the button with X icon
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => {
        const svg = btn.querySelector('svg.lucide-x');
        return svg !== null;
      });

      expect(closeButton).toBeTruthy();
      if (closeButton) {
        await userEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Description')).not.toBeInTheDocument();
      });
    });

    it('should close modal when Cancel button clicked', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Corporate Formation');
      await userEvent.click(template);

      const cancelButton = await screen.findByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Description')).not.toBeInTheDocument();
      });
    });
  });

  describe('Case Creation from Template', () => {
    it('should call onCreateFromTemplate when Use Template clicked on card', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const useButtons = screen.getAllByRole('button', { name: /Use Template/i });
      await userEvent.click(useButtons[0]);

      expect(defaultProps.onCreateFromTemplate).toHaveBeenCalledWith(mockTemplates[0]);
    });

    it('should call onCreateFromTemplate from detail modal', async () => {
      render(<CaseTemplates {...defaultProps} />);

      // Open modal
      const template = screen.getByText('Corporate Formation');
      await userEvent.click(template);

      // Click create button in modal
      const createButton = await screen.findByRole('button', { name: /Create Case from Template/i });
      await userEvent.click(createButton);

      // Verify it was called with the Corporate Formation template
      expect(defaultProps.onCreateFromTemplate).toHaveBeenCalled();
      const calledTemplate = defaultProps.onCreateFromTemplate.mock.calls[0][0];
      expect(calledTemplate.name).toBe('Corporate Formation');
    });

    it('should close modal after creating case from template', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Corporate Formation');
      await userEvent.click(template);

      const createButton = await screen.findByRole('button', { name: /Create Case from Template/i });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.queryByText('Description')).not.toBeInTheDocument();
      });
    });
  });

  describe('Template Cloning', () => {
    it('should call onCloneTemplate when clone button clicked', async () => {
      render(<CaseTemplates {...defaultProps} />);

      // Find clone buttons (copy icons)
      const cloneButtons = screen.getAllByRole('button');
      const cloneButton = cloneButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.getAttribute('class')?.includes('border-gray-300');
      });

      if (cloneButton) {
        await userEvent.click(cloneButton);
        expect(defaultProps.onCloneTemplate).toHaveBeenCalled();
      }
    });

    it('should prevent event propagation when clone clicked', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const cloneButtons = screen.getAllByRole('button');
      const cloneButton = cloneButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && btn.getAttribute('class')?.includes('border-gray-300');
      });

      if (cloneButton) {
        await userEvent.click(cloneButton);
        // Modal should NOT open
        expect(screen.queryByText('Description')).not.toBeInTheDocument();
      }
    });
  });

  describe('Template Editing', () => {
    it('should call onEditTemplate when Edit Template clicked in modal', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Corporate Formation');
      await userEvent.click(template);

      const editButton = await screen.findByRole('button', { name: /Edit Template/i });
      await userEvent.click(editButton);

      // Verify it was called with the Corporate Formation template
      expect(defaultProps.onEditTemplate).toHaveBeenCalled();
      const calledTemplate = defaultProps.onEditTemplate.mock.calls[0][0];
      expect(calledTemplate.name).toBe('Corporate Formation');
    });
  });

  describe('Template Statistics', () => {
    it('should display overview stats in modal', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Civil Litigation - Breach of Contract');
      await userEvent.click(template);

      await waitFor(() => {
        expect(screen.getByText('365 days')).toBeInTheDocument();
        expect(screen.getByText('$50,000')).toBeInTheDocument();
        expect(screen.getByText('24 times')).toBeInTheDocument();
      });
    });

    it('should show checklist count with items', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Civil Litigation - Breach of Contract');
      await userEvent.click(template);

      await waitFor(() => {
        expect(screen.getByText(/Checklist \(2 items\)/i)).toBeInTheDocument();
      });
    });

    it('should show document count', async () => {
      render(<CaseTemplates {...defaultProps} />);

      const template = screen.getByText('Civil Litigation - Breach of Contract');
      await userEvent.click(template);

      await waitFor(() => {
        expect(screen.getByText(/Required Documents \(2\)/i)).toBeInTheDocument();
      });
    });

    it('should limit checklist display to 5 items', async () => {
      const templateWithManyItems: CaseTemplate = {
        ...mockTemplates[0],
        checklist: [
          { id: 'cl-1', title: 'Task 1', order: 1 },
          { id: 'cl-2', title: 'Task 2', order: 2 },
          { id: 'cl-3', title: 'Task 3', order: 3 },
          { id: 'cl-4', title: 'Task 4', order: 4 },
          { id: 'cl-5', title: 'Task 5', order: 5 },
          { id: 'cl-6', title: 'Task 6', order: 6 },
          { id: 'cl-7', title: 'Task 7', order: 7 },
        ],
      };

      render(<CaseTemplates {...defaultProps} templates={[templateWithManyItems]} />);

      // Find and click the template card by its name
      const templateName = await screen.findByText(templateWithManyItems.name);
      await userEvent.click(templateName);

      await waitFor(() => {
        expect(screen.getByText('+ 2 more items')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no templates provided', () => {
      render(<CaseTemplates {...defaultProps} templates={[]} />);

      expect(screen.getByText('No templates found')).toBeInTheDocument();
    });

    it('should show empty state message', () => {
      render(<CaseTemplates {...defaultProps} templates={[]} />);

      expect(screen.getByText(/Try adjusting your search or filters/i)).toBeInTheDocument();
    });
  });

  describe('Template Sorting', () => {
    it('should sort templates by usage count (most used first)', () => {
      render(<CaseTemplates {...defaultProps} />);

      const templateCards = screen.getAllByText(/Used \d+ times/);

      // Real Estate has 31 uses, should be first
      // Litigation has 24 uses
      // Corporate has 18 uses
      expect(templateCards[0]).toHaveTextContent('Used 31 times');
    });
  });

  describe('Create Template Button', () => {
    it('should render Create Template button', () => {
      render(<CaseTemplates {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Create Template/i })).toBeInTheDocument();
    });
  });
});

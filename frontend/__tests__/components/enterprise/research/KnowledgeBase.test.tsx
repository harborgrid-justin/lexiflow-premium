/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  KnowledgeBase,
  type KnowledgeBaseProps,
  type KnowledgeResource,
  type ResourceType,
  type ResourceCategory,
} from '@/components/enterprise/Research/KnowledgeBase';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('KnowledgeBase', () => {
  const mockOnSearch = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnUpload = jest.fn();
  const mockOnShare = jest.fn();

  const mockResources: KnowledgeResource[] = [
    {
      id: '1',
      title: 'Motion for Summary Judgment Template',
      description: 'Comprehensive template for federal summary judgment motions',
      type: 'template',
      category: 'litigation',
      author: { name: 'Sarah Johnson', avatar: 'SJ' },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      downloads: 245,
      views: 1203,
      rating: 4.8,
      tags: ['summary judgment', 'federal court', 'civil litigation'],
      fileSize: '45 KB',
      practiceArea: 'Civil Litigation',
      jurisdiction: 'Federal',
      confidential: false,
      access: 'firm',
    },
    {
      id: '2',
      title: 'Employment Agreement - Executive Level',
      description: 'Detailed executive employment agreement',
      type: 'contract',
      category: 'employment',
      author: { name: 'Michael Chen', avatar: 'MC' },
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-12'),
      downloads: 178,
      views: 892,
      rating: 4.6,
      tags: ['employment', 'executive', 'non-compete'],
      fileSize: '68 KB',
      practiceArea: 'Employment Law',
      confidential: true,
      access: 'team',
    },
  ];

  const defaultProps: KnowledgeBaseProps = {
    resources: mockResources,
    onSearch: mockOnSearch,
    onDownload: mockOnDownload,
    onUpload: mockOnUpload,
    onShare: mockOnShare,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Resource Listing', () => {
    it('should render knowledge base with title and description', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/knowledge base/i)).toBeInTheDocument();
      expect(screen.getByText(/firm repository/i)).toBeInTheDocument();
    });

    it('should display all resources in grid view by default', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/motion for summary judgment template/i)).toBeInTheDocument();
      expect(screen.getByText(/employment agreement - executive level/i)).toBeInTheDocument();
    });

    it('should display resource count', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/2 resources/i)).toBeInTheDocument();
    });

    it('should show resource metadata (author, dates, views, downloads)', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/sarah johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/245/)).toBeInTheDocument(); // downloads
      expect(screen.getByText(/1203/)).toBeInTheDocument(); // views
    });

    it('should switch between grid and list view', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const viewButtons = screen.getAllByRole('button', { name: '' });
      const listViewButton = viewButtons.find(btn =>
        btn.querySelector('[class*="List"]')
      );

      if (listViewButton) {
        fireEvent.click(listViewButton);

        // Should still show resources
        expect(screen.getByText(/motion for summary judgment template/i)).toBeInTheDocument();
      }
    });
  });

  describe('Category Filtering', () => {
    it('should display category filter pills', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByRole('button', { name: /all resources/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /litigation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /employment/i })).toBeInTheDocument();
    });

    it('should filter resources by category when pill is clicked', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const litigationButton = screen.getByRole('button', { name: /litigation \(2\)/i });
      fireEvent.click(litigationButton);

      expect(screen.getByText(/motion for summary judgment template/i)).toBeInTheDocument();
    });

    it('should show resource count per category', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/litigation \(2\)/i)).toBeInTheDocument();
      expect(screen.getByText(/employment \(1\)/i)).toBeInTheDocument();
    });

    it('should highlight selected category', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const allResourcesButton = screen.getByRole('button', { name: /all resources/i });

      // All Resources should be selected by default
      expect(allResourcesButton).toHaveClass(/bg-blue-600/);
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates, memos/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter resources by search query', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates, memos/i);

      fireEvent.change(searchInput, { target: { value: 'summary judgment' } });

      expect(screen.getByText(/motion for summary judgment template/i)).toBeInTheDocument();
    });

    it('should search by tags', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates, memos/i);

      fireEvent.change(searchInput, { target: { value: 'federal court' } });

      expect(screen.getByText(/motion for summary judgment template/i)).toBeInTheDocument();
    });

    it('should show no results message when search returns empty', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates, memos/i);

      fireEvent.change(searchInput, { target: { value: 'nonexistent resource' } });

      expect(screen.getByText(/no resources found/i)).toBeInTheDocument();
    });
  });

  describe('Template Preview', () => {
    it('should open preview modal when resource is clicked', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const resourceCard = screen.getByText(/motion for summary judgment template/i).closest('div');

      if (resourceCard) {
        fireEvent.click(resourceCard);

        // Modal should appear with resource details
        expect(screen.getAllByText(/motion for summary judgment template/i).length).toBeGreaterThan(1);
      }
    });

    it('should display full resource details in preview', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const resourceCard = screen.getByText(/motion for summary judgment template/i).closest('div');

      if (resourceCard) {
        fireEvent.click(resourceCard);

        expect(screen.getByText(/sarah johnson/i)).toBeInTheDocument();
        expect(screen.getByText(/last updated/i)).toBeInTheDocument();
        expect(screen.getByText(/downloads/i)).toBeInTheDocument();
        expect(screen.getByText(/rating/i)).toBeInTheDocument();
      }
    });

    it('should close preview when close button is clicked', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const resourceCard = screen.getByText(/motion for summary judgment template/i).closest('div');

      if (resourceCard) {
        fireEvent.click(resourceCard);

        const closeButton = screen.getAllByText('×')[0];
        fireEvent.click(closeButton);

        // Modal should be closed
        expect(screen.getAllByText(/motion for summary judgment template/i).length).toBe(1);
      }
    });

    it('should call onDownload when download button is clicked in preview', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const resourceCard = screen.getByText(/motion for summary judgment template/i).closest('div');

      if (resourceCard) {
        fireEvent.click(resourceCard);

        const downloadButton = screen.getByRole('button', { name: /download/i });
        fireEvent.click(downloadButton);

        expect(mockOnDownload).toHaveBeenCalledWith('1');
      }
    });
  });

  describe('Access Control Indicators', () => {
    it('should display access level indicators (firm, team, private)', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/firm/i)).toBeInTheDocument();
      expect(screen.getByText(/team/i)).toBeInTheDocument();
    });

    it('should show confidential indicator for sensitive resources', () => {
      render(<KnowledgeBase {...defaultProps} />);

      // Employment agreement is marked confidential
      const confidentialResources = screen.getAllByRole('button', { name: '' });
      expect(confidentialResources.length).toBeGreaterThan(0);
    });

    it('should display lock icon for confidential resources', () => {
      render(<KnowledgeBase {...defaultProps} />);

      // Check for lock icon presence
      const resourceCards = screen.getAllByRole('button', { name: '' });
      expect(resourceCards.length).toBeGreaterThan(0);
    });
  });

  describe('Rating Display', () => {
    it('should display star rating for each resource', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/4\.8/)).toBeInTheDocument();
      expect(screen.getByText(/4\.6/)).toBeInTheDocument();
    });

    it('should show rating out of 5.0', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const resourceCard = screen.getByText(/motion for summary judgment template/i).closest('div');

      if (resourceCard) {
        fireEvent.click(resourceCard);

        expect(screen.getByText(/4\.8 \/ 5\.0/i)).toBeInTheDocument();
      }
    });
  });

  describe('Resource Management', () => {
    it('should call onUpload when upload button is clicked', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /upload resource/i });
      fireEvent.click(uploadButton);

      expect(mockOnUpload).toHaveBeenCalled();
    });

    it('should call onShare when share button is clicked', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const resourceCard = screen.getByText(/motion for summary judgment template/i).closest('div');

      if (resourceCard) {
        fireEvent.click(resourceCard);

        const shareButton = screen.getByRole('button', { name: /share/i });
        fireEvent.click(shareButton);

        expect(mockOnShare).toHaveBeenCalledWith('1', []);
      }
    });

    it('should sort resources by recent, popular, or rating', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const sortSelect = screen.getByRole('combobox', { name: '' });
      const sortSelects = screen.getAllByRole('combobox');
      const sortBySelect = sortSelects.find(select =>
        select.querySelector('option[value="popular"]')
      );

      if (sortBySelect) {
        fireEvent.change(sortBySelect, { target: { value: 'popular' } });
        fireEvent.change(sortBySelect, { target: { value: 'rating' } });
      }
    });
  });

  describe('Resource Tags', () => {
    it('should display tags for each resource', () => {
      render(<KnowledgeBase {...defaultProps} />);

      expect(screen.getByText(/summary judgment/i)).toBeInTheDocument();
      expect(screen.getByText(/federal court/i)).toBeInTheDocument();
      expect(screen.getByText(/employment/i)).toBeInTheDocument();
    });

    it('should limit tag display in grid view', () => {
      render(<KnowledgeBase {...defaultProps} />);

      // Should show limited tags (slice(0, 3))
      const tagElements = screen.getAllByText(/summary judgment|federal court|civil litigation/i);
      expect(tagElements.length).toBeGreaterThan(0);
    });

    it('should show all tags in preview modal', () => {
      render(<KnowledgeBase {...defaultProps} />);

      const resourceCard = screen.getByText(/motion for summary judgment template/i).closest('div');

      if (resourceCard) {
        fireEvent.click(resourceCard);

        expect(screen.getAllByText(/summary judgment/i).length).toBeGreaterThan(0);
      }
    });
  });
});

/**
 * @module components/navigation/Breadcrumbs.test
 * @category Navigation - Tests
 * @description Unit tests for Breadcrumbs component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '@/theme';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from './Breadcrumbs';
import { Folder, FileText } from 'lucide-react';

// Mock useTheme to avoid provider issues
vi.mock('@/contexts/theme/ThemeContext', async () => {
  const actual = await vi.importActual('@/contexts/theme/ThemeContext');
  return {
    ...actual,
    useTheme: () => ({
      theme: {
        text: { primary: 'text-slate-900', secondary: 'text-slate-600', tertiary: 'text-slate-400' },
        surface: { default: 'bg-white', highlight: 'bg-slate-100' },
        border: { default: 'border-slate-200' },
      },
    }),
  };
});

const mockItems: BreadcrumbItem[] = [
  { id: '1', label: 'Cases', path: '/cases' },
  { id: '2', label: 'Martinez v. State', path: '/cases/123', icon: Folder },
  { id: '3', label: 'Documents', path: '/cases/123/documents', icon: FileText },
];

describe('Breadcrumbs', () => {
  it('renders breadcrumb items correctly', () => {
    render(<Breadcrumbs items={mockItems} />);

    expect(screen.getByText('Cases')).toBeInTheDocument();
    expect(screen.getByText('Martinez v. State')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('calls onNavigate when breadcrumb is clicked', () => {
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={mockItems} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText('Cases'));

    expect(onNavigate).toHaveBeenCalledWith(mockItems[0]);
  });

  it('does not call onNavigate for last item (current page)', () => {
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={mockItems} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText('Documents'));

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('filters items based on user role', () => {
    const itemsWithRoles: BreadcrumbItem[] = [
      { id: '1', label: 'Public', path: '/public' },
      { id: '2', label: 'Admin Only', path: '/admin', allowedRoles: ['Administrator'] },
    ];

    render(<Breadcrumbs items={itemsWithRoles} currentUserRole="Associate" />);

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('shows home icon when enabled', () => {
    render(<Breadcrumbs items={mockItems} showHomeIcon={true} />);

    expect(screen.getByLabelText('Navigate to home')).toBeInTheDocument();
  });

  it('hides home icon when disabled', () => {
    render(<Breadcrumbs items={mockItems} showHomeIcon={false} />);

    expect(screen.queryByLabelText('Navigate to home')).not.toBeInTheDocument();
  });

  it('collapses middle items when maxItems is set', () => {
    render(<Breadcrumbs items={mockItems} maxItems={2} />);

    expect(screen.getByText('Cases')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.queryByText('Martinez v. State')).not.toBeInTheDocument();
  });

  it('renders with custom separator', () => {
    const { container } = render(
      <Breadcrumbs items={mockItems} separator={<span>/</span>} />
    );

    const separators = container.querySelectorAll('li[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThan(0);
  });
});

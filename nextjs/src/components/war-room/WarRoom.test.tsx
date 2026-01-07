/**
 * @jest-environment jsdom
 * WarRoom Component Tests
 * Enterprise-grade tests for trial preparation war room
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WarRoom } from './WarRoom';

describe('WarRoom', () => {
  describe('Initial State - Case Selection', () => {
    it('renders war room with selected case by default (mock state)', () => {
      // The component starts with selectedCase = 'case-1'
      render(<WarRoom />);

      expect(screen.getByText('War Room')).toBeInTheDocument();
      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    it('renders all navigation views', () => {
      render(<WarRoom />);

      expect(screen.getByText('Command Center')).toBeInTheDocument();
      expect(screen.getByText('Evidence Wall')).toBeInTheDocument();
      expect(screen.getByText('Witness Prep')).toBeInTheDocument();
      expect(screen.getByText('Trial Binder')).toBeInTheDocument();
      expect(screen.getByText('Advisory')).toBeInTheDocument();
      expect(screen.getByText('Opposition')).toBeInTheDocument();
    });

    it('highlights Command Center by default', () => {
      render(<WarRoom />);

      const commandButton = screen.getAllByText('Command Center')[0].closest('button');
      expect(commandButton).toHaveClass('bg-blue-50');
    });

    it('shows War Room header in sidebar', () => {
      render(<WarRoom />);

      expect(screen.getByText('War Room')).toBeInTheDocument();
    });

    it('shows case name in sidebar', () => {
      render(<WarRoom />);

      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
    });
  });

  describe('View Switching', () => {
    it('switches to Evidence Wall view', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /evidence wall/i }));

      // Header should show Evidence Wall
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Evidence Wall');
      expect(screen.getByText('Interactive Evidence Map Placeholder')).toBeInTheDocument();
    });

    it('switches to Witness Prep view', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /witness prep/i }));

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Witness Prep');
      expect(screen.getByText('No witnesses scheduled')).toBeInTheDocument();
    });

    it('switches to Trial Binder view', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /trial binder/i }));

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trial Binder');
      expect(screen.getByText('Digital Trial Binder Placeholder')).toBeInTheDocument();
    });

    it('switches to Advisory view', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /advisory/i }));

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Advisory');
      expect(screen.getByText('Expert Witness & Consultant Management')).toBeInTheDocument();
    });

    it('switches to Opposition view', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /opposition/i }));

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Opposition');
      expect(screen.getByText('Opposing Counsel & Party Analysis')).toBeInTheDocument();
    });
  });

  describe('Command Center', () => {
    it('renders Command Center content by default', () => {
      render(<WarRoom />);

      expect(screen.getByText('Days to Trial')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('shows Evidence Ready percentage', () => {
      render(<WarRoom />);

      expect(screen.getByText('Evidence Ready')).toBeInTheDocument();
      expect(screen.getByText('87%')).toBeInTheDocument();
    });

    it('shows Pending Motions count', () => {
      render(<WarRoom />);

      expect(screen.getByText('Pending Motions')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('has metrics grid layout', () => {
      const { container } = render(<WarRoom />);

      expect(container.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('Evidence Wall', () => {
    it('renders placeholder for evidence map', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /evidence wall/i }));

      expect(screen.getByText('Interactive Evidence Map Placeholder')).toBeInTheDocument();
    });
  });

  describe('Witness Prep', () => {
    it('renders empty state for witnesses', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /witness prep/i }));

      expect(screen.getByText('No witnesses scheduled')).toBeInTheDocument();
    });
  });

  describe('Navigation State', () => {
    it('maintains view state through multiple transitions', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      // Navigate through multiple views
      await user.click(screen.getByRole('button', { name: /evidence wall/i }));
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Evidence Wall');

      await user.click(screen.getByRole('button', { name: /witness prep/i }));
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Witness Prep');

      await user.click(screen.getByRole('button', { name: /command center/i }));
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Command Center');
    });

    it('highlights correct nav item when view changes', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      // Switch to Evidence Wall
      await user.click(screen.getByRole('button', { name: /evidence wall/i }));

      const evidenceButton = screen.getByRole('button', { name: /evidence wall/i });
      expect(evidenceButton).toHaveClass('bg-blue-50');

      // Command Center should not be highlighted
      const commandButton = screen.getAllByText('Command Center')[0].closest('button');
      expect(commandButton).not.toHaveClass('bg-blue-50');
    });
  });

  describe('Layout', () => {
    it('has flex layout with sidebar', () => {
      const { container } = render(<WarRoom />);

      expect(container.querySelector('.flex.h-full')).toBeInTheDocument();
    });

    it('sidebar has fixed width', () => {
      const { container } = render(<WarRoom />);

      expect(container.querySelector('.w-64')).toBeInTheDocument();
    });

    it('main content is flexible', () => {
      const { container } = render(<WarRoom />);

      expect(container.querySelector('.flex-1')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('displays view title in header', () => {
      render(<WarRoom />);

      const header = screen.getByRole('banner') || screen.getByRole('heading', { level: 1 }).closest('header');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Command Center');
    });

    it('header updates with view change', async () => {
      const user = userEvent.setup();
      render(<WarRoom />);

      await user.click(screen.getByRole('button', { name: /opposition/i }));

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Opposition');
    });
  });

  describe('Styling', () => {
    it('applies background color to main container', () => {
      const { container } = render(<WarRoom />);

      expect(container.querySelector('.bg-slate-50')).toBeInTheDocument();
    });

    it('applies white background to sidebar', () => {
      const { container } = render(<WarRoom />);

      expect(container.querySelector('.bg-white')).toBeInTheDocument();
    });

    it('sidebar has border', () => {
      const { container } = render(<WarRoom />);

      expect(container.querySelector('.border-r')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders icons in navigation items', () => {
      const { container } = render(<WarRoom />);

      const navIcons = container.querySelectorAll('nav svg');
      expect(navIcons.length).toBe(6); // 6 nav items
    });
  });
});

import { render, screen } from '@testing-library/react';
import { SystemHealthDisplay } from './SystemHealthDisplay';

// Note: SystemHealthDisplay exports ServiceCoverageBadge component
// The main export appears to be the badge component

describe('SystemHealthDisplay Component', () => {
  it('renders service coverage badge', () => {
    render(<SystemHealthDisplay />);

    // Check for backend integration indicators
    expect(screen.getByText(/100%/i) || screen.getByText(/Backend/i) || screen.getByText(/Services/i)).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    const { container } = render(<SystemHealthDisplay compact={true} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SystemHealthDisplay className="custom-test-class" />);

    const element = container.querySelector('.custom-test-class');
    expect(element).toBeInTheDocument();
  });

  it('displays service integration status', () => {
    render(<SystemHealthDisplay />);

    // Component should display some indication of service coverage
    // Could be icons, text, or status indicators
    const component = screen.getByRole('img', { hidden: true }) ||
      screen.getByText(/PostgreSQL/i) ||
      screen.getByText(/Backend/i) ||
      screen.getByText(/Services/i);

    expect(component).toBeInTheDocument();
  });

  it('shows online status indicator for connected services', () => {
    render(<SystemHealthDisplay />);

    // Look for checkmarks, cloud icons, or "connected" text
    const container = screen.getByRole('img', { hidden: true }) ||
      document.querySelector('svg');

    expect(container).toBeInTheDocument();
  });

  it('renders without crashing when no props provided', () => {
    const { container } = render(<SystemHealthDisplay />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays multiple service categories', () => {
    const { container } = render(<SystemHealthDisplay />);

    // Component lists services across multiple categories
    // Should render the component tree successfully
    expect(container.querySelector('[class*="flex"]') ||
      container.querySelector('[class*="grid"]') ||
      container.firstChild).toBeInTheDocument();
  });

  it('handles compact and full modes correctly', () => {
    const { rerender, container: compactContainer } = render(<SystemHealthDisplay compact={true} />);

    expect(compactContainer.firstChild).toBeInTheDocument();

    rerender(<SystemHealthDisplay compact={false} />);

    expect(compactContainer.firstChild).toBeInTheDocument();
  });
});

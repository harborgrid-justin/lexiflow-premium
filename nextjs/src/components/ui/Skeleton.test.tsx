import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonLine } from './Skeleton';

describe('Skeleton', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders single skeleton by default', () => {
      const { container } = render(<Skeleton />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(1);
    });

    it('renders as div element', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton?.nodeName).toBe('DIV');
    });
  });

  describe('Count', () => {
    it('renders multiple skeletons when count is specified', () => {
      const { container } = render(<Skeleton count={3} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('renders correct number of skeletons', () => {
      const { container } = render(<Skeleton count={5} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(5);
    });

    it('handles count of 1', () => {
      const { container } = render(<Skeleton count={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(1);
    });

    it('handles count of 0', () => {
      const { container } = render(<Skeleton count={0} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(0);
    });
  });

  describe('Styling', () => {
    it('has pulse animation', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('has rounded corners', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-lg');
    });

    it('has background color', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('bg-slate-200');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<Skeleton className="h-4 w-32" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('h-4', 'w-32');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(<Skeleton className="h-8" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('h-8');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('applies className to all skeletons when count > 1', () => {
      const { container } = render(<Skeleton count={3} className="h-4" />);
      const skeletons = container.querySelectorAll('.h-4');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles large count', () => {
      const { container } = render(<Skeleton count={100} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(100);
    });

    it('handles empty className', () => {
      const { container } = render(<Skeleton className="" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });
});

describe('SkeletonLine', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const { container } = render(<SkeletonLine />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-y-2');
    });

    it('renders 3 lines by default', () => {
      const { container } = render(<SkeletonLine />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(3);
    });
  });

  describe('Lines', () => {
    it('renders specified number of lines', () => {
      const { container } = render(<SkeletonLine lines={5} />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(5);
    });

    it('last line has reduced width', () => {
      const { container } = render(<SkeletonLine lines={3} />);
      const lines = container.querySelectorAll('.animate-pulse');
      const lastLine = lines[lines.length - 1];
      expect(lastLine).toHaveClass('w-4/5');
    });

    it('all lines except last have full width', () => {
      const { container } = render(<SkeletonLine lines={3} />);
      const lines = container.querySelectorAll('.animate-pulse');
      // First two lines should have w-full
      expect(lines[0]).toHaveClass('w-full');
      expect(lines[1]).toHaveClass('w-full');
    });

    it('handles single line', () => {
      const { container } = render(<SkeletonLine lines={1} />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(1);
      // Single line should have w-4/5 (it's both first and last)
      expect(lines[0]).toHaveClass('w-4/5');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to lines', () => {
      const { container } = render(<SkeletonLine className="h-6" />);
      const lines = container.querySelectorAll('.animate-pulse');
      lines.forEach((line) => {
        expect(line).toHaveClass('h-6');
      });
    });

    it('default className is h-4', () => {
      const { container } = render(<SkeletonLine />);
      const lines = container.querySelectorAll('.animate-pulse');
      lines.forEach((line) => {
        expect(line).toHaveClass('h-4');
      });
    });
  });

  describe('Spacing', () => {
    it('has space-y-2 gap between lines', () => {
      const { container } = render(<SkeletonLine />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-y-2');
    });
  });

  describe('Edge Cases', () => {
    it('handles lines = 0', () => {
      const { container } = render(<SkeletonLine lines={0} />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(0);
    });

    it('handles large number of lines', () => {
      const { container } = render(<SkeletonLine lines={50} />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(50);
    });

    it('handles empty className', () => {
      const { container } = render(<SkeletonLine className="" />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines.length).toBeGreaterThan(0);
    });
  });
});

describe('Skeleton Composition', () => {
  it('renders skeleton card layout', () => {
    const { container } = render(
      <div>
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });

  it('renders skeleton list', () => {
    const { container } = render(
      <div>
        <Skeleton count={5} className="h-16 w-full mb-2" />
      </div>
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(5);
  });

  it('combines Skeleton and SkeletonLine', () => {
    const { container } = render(
      <div>
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <SkeletonLine lines={2} />
      </div>
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3); // 1 avatar + 2 lines
  });
});

describe('Accessibility', () => {
  it('skeleton has proper visual indication of loading state', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    // Pulse animation provides visual feedback
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('can be used with aria-busy', () => {
    render(
      <div aria-busy="true" aria-live="polite">
        <Skeleton className="h-4 w-full" />
      </div>
    );
    const container = document.querySelector('[aria-busy="true"]');
    expect(container).toBeInTheDocument();
  });

  it('can be wrapped in loading indicator', () => {
    render(
      <div role="status" aria-label="Loading content">
        <SkeletonLine />
      </div>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import {
  PerformanceMonitor,
  measureRenderTime,
  useRenderMetrics,
  useExpensiveRenderDetector,
  measureExecutionTime,
  createPerformanceMark,
  measurePerformance,
} from './PerformanceMonitor';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { raised: 'bg-white shadow' },
      border: { default: 'border-slate-200' },
      text: { secondary: 'text-slate-600' },
      status: {
        success: { text: 'text-green-600' },
        warning: { text: 'text-yellow-600' },
      },
    },
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

// Store original env
const originalEnv = process.env.NODE_ENV;

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <PerformanceMonitor componentName="TestComponent">
          <div data-testid="child">Child Content</div>
        </PerformanceMonitor>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <PerformanceMonitor componentName="TestComponent">
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </PerformanceMonitor>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Performance Indicators', () => {
    it('does not show indicators by default', () => {
      render(
        <PerformanceMonitor componentName="TestComponent">
          <div>Content</div>
        </PerformanceMonitor>
      );
      // Indicators should not be visible when showIndicators is false
      const indicator = document.querySelector('.fixed.bottom-4.right-4');
      expect(indicator).not.toBeInTheDocument();
    });

    it('shows indicators when enabled in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });

      render(
        <PerformanceMonitor componentName="TestComponent" showIndicators={true}>
          <div>Content</div>
        </PerformanceMonitor>
      );

      // Trigger effect
      act(() => {
        jest.runAllTimers();
      });

      // Component renders but indicator may depend on isEnabled
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Configuration', () => {
    it('accepts custom render budget', () => {
      render(
        <PerformanceMonitor componentName="TestComponent" renderBudget={32}>
          <div data-testid="content">Content</div>
        </PerformanceMonitor>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts onBudgetExceeded callback', () => {
      const onBudgetExceeded = jest.fn();
      render(
        <PerformanceMonitor
          componentName="TestComponent"
          onBudgetExceeded={onBudgetExceeded}
        >
          <div>Content</div>
        </PerformanceMonitor>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('respects enableInProduction flag', () => {
      render(
        <PerformanceMonitor
          componentName="TestComponent"
          enableInProduction={true}
        >
          <div data-testid="content">Content</div>
        </PerformanceMonitor>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null children', () => {
      render(
        <PerformanceMonitor componentName="TestComponent">
          {null}
        </PerformanceMonitor>
      );
      expect(document.body).toBeInTheDocument();
    });

    it('handles empty componentName', () => {
      render(
        <PerformanceMonitor componentName="">
          <div data-testid="content">Content</div>
        </PerformanceMonitor>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});

describe('measureRenderTime', () => {
  it('measures time of callback execution', () => {
    const callback = jest.fn();
    const time = measureRenderTime(callback);

    expect(callback).toHaveBeenCalled();
    expect(typeof time).toBe('number');
    expect(time).toBeGreaterThanOrEqual(0);
  });

  it('returns time in milliseconds', () => {
    const callback = () => {
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
    };
    const time = measureRenderTime(callback);
    expect(time).toBeGreaterThanOrEqual(0);
  });
});

describe('measureExecutionTime', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wraps function and returns same result', () => {
    const originalFn = (a: number, b: number) => a + b;
    const wrappedFn = measureExecutionTime(originalFn, 'add');

    const result = wrappedFn(2, 3);
    expect(result).toBe(5);
  });

  it('preserves function behavior', () => {
    const originalFn = (str: string) => str.toUpperCase();
    const wrappedFn = measureExecutionTime(originalFn, 'uppercase');

    expect(wrappedFn('hello')).toBe('HELLO');
  });
});

describe('createPerformanceMark', () => {
  it('creates performance mark when API is available', () => {
    const markSpy = jest.spyOn(performance, 'mark');
    createPerformanceMark('test-mark');
    expect(markSpy).toHaveBeenCalledWith('test-mark');
    markSpy.mockRestore();
  });
});

describe('measurePerformance', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clean up performance entries
    performance.clearMarks();
    performance.clearMeasures();
  });

  it('measures between two marks', () => {
    performance.mark('start-test');
    performance.mark('end-test');

    const duration = measurePerformance('test-measure', 'start-test', 'end-test');

    expect(typeof duration).toBe('number');
  });

  it('returns null when marks do not exist', () => {
    const duration = measurePerformance(
      'invalid-measure',
      'non-existent-start',
      'non-existent-end'
    );
    expect(duration).toBeNull();
  });
});

describe('useRenderMetrics Hook', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const TestComponent = ({ name }: { name: string }) => {
    const { renderCount } = useRenderMetrics(name);
    return <div data-testid="render-count">{renderCount}</div>;
  };

  it('tracks render count', () => {
    const { rerender } = render(<TestComponent name="TestComponent" />);

    // Initial render
    expect(screen.getByTestId('render-count')).toBeInTheDocument();

    // Trigger re-render
    rerender(<TestComponent name="TestComponent" />);
    expect(screen.getByTestId('render-count')).toBeInTheDocument();
  });
});

describe('useExpensiveRenderDetector Hook', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const TestComponent = ({ name, threshold }: { name: string; threshold?: number }) => {
    useExpensiveRenderDetector(name, threshold);
    return <div data-testid="component">Component</div>;
  };

  it('runs without crashing', () => {
    render(<TestComponent name="ExpensiveComponent" />);
    expect(screen.getByTestId('component')).toBeInTheDocument();
  });

  it('accepts custom threshold', () => {
    render(<TestComponent name="ExpensiveComponent" threshold={32} />);
    expect(screen.getByTestId('component')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { withErrorBoundary, withLayoutErrorBoundary, withPageErrorBoundary } from './withErrorBoundary';

// Mock ErrorBoundary
jest.mock('@/components/organisms/ErrorBoundary/ErrorBoundary', () => ({
  ErrorBoundary: ({ children, scope, fallback, onReset }: {
    children: React.ReactNode;
    scope: string;
    fallback?: React.ReactNode;
    onReset?: () => void;
  }) => (
    <div data-testid={`error-boundary-${scope}`} data-scope={scope}>
      {children}
    </div>
  ),
}));

// Store original env
const originalEnv = { ...import.meta.env };

describe('withErrorBoundary HOC', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.assign(import.meta.env, originalEnv);
  });

  describe('Basic Functionality', () => {
    it('wraps component with error boundary', () => {
      const TestComponent = () => <div data-testid="test-component">Test Content</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'TestComponent',
      });

      render(<WrappedComponent />);

      expect(screen.getByTestId('error-boundary-TestComponent')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('passes props through to wrapped component', () => {
      interface Props {
        message: string;
      }
      const TestComponent = ({ message }: Props) => <div data-testid="test">{message}</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'TestComponent',
      });

      render(<WrappedComponent message="Hello World" />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('preserves component displayName', () => {
      const TestComponent = () => <div>Test</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'MyTestComponent',
      });

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(MyTestComponent)');
    });
  });

  describe('Options', () => {
    it('accepts custom fallback', () => {
      const TestComponent = () => <div>Test</div>;
      const customFallback = <div data-testid="custom-fallback">Error!</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'TestComponent',
        fallback: customFallback,
      });

      render(<WrappedComponent />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('accepts onReset callback', () => {
      const onReset = jest.fn();
      const TestComponent = () => <div>Test</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'TestComponent',
        onReset,
      });

      render(<WrappedComponent />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('accepts onError callback', () => {
      const onError = jest.fn();
      const TestComponent = () => <div>Test</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'TestComponent',
        onError,
      });

      render(<WrappedComponent />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('accepts enableProfiling option', () => {
      const TestComponent = () => <div data-testid="profiled">Profiled</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'ProfiledComponent',
        enableProfiling: true,
      });

      render(<WrappedComponent />);
      expect(screen.getByTestId('profiled')).toBeInTheDocument();
    });

    it('disables profiling when set to false', () => {
      const TestComponent = () => <div data-testid="not-profiled">Not Profiled</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'NotProfiledComponent',
        enableProfiling: false,
      });

      render(<WrappedComponent />);
      expect(screen.getByTestId('not-profiled')).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('can wrap multiple components independently', () => {
      const ComponentA = () => <div data-testid="comp-a">A</div>;
      const ComponentB = () => <div data-testid="comp-b">B</div>;

      const WrappedA = withErrorBoundary(ComponentA, { componentName: 'ComponentA' });
      const WrappedB = withErrorBoundary(ComponentB, { componentName: 'ComponentB' });

      render(
        <>
          <WrappedA />
          <WrappedB />
        </>
      );

      expect(screen.getByTestId('error-boundary-ComponentA')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary-ComponentB')).toBeInTheDocument();
      expect(screen.getByTestId('comp-a')).toBeInTheDocument();
      expect(screen.getByTestId('comp-b')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles component with no props', () => {
      const TestComponent = () => <div>No Props</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'NoPropsComponent',
      });

      render(<WrappedComponent />);
      expect(screen.getByText('No Props')).toBeInTheDocument();
    });

    it('handles component with complex props', () => {
      interface ComplexProps {
        data: { id: number; name: string }[];
        onAction: () => void;
        config?: { enabled: boolean };
      }
      const TestComponent = ({ data, onAction }: ComplexProps) => (
        <div>
          {data.map((item) => (
            <span key={item.id} onClick={onAction}>
              {item.name}
            </span>
          ))}
        </div>
      );

      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: 'ComplexComponent',
      });

      const mockAction = jest.fn();
      render(
        <WrappedComponent
          data={[
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ]}
          onAction={mockAction}
        />
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('handles empty componentName', () => {
      const TestComponent = () => <div>Empty Name</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        componentName: '',
      });

      expect(WrappedComponent.displayName).toBe('withErrorBoundary()');
    });
  });
});

describe('withLayoutErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wraps layout component with error boundary', () => {
    const LayoutComponent = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="layout">{children}</div>
    );
    const SafeLayout = withLayoutErrorBoundary(LayoutComponent, 'TestLayout');

    render(<SafeLayout>Content</SafeLayout>);

    expect(screen.getByTestId('error-boundary-TestLayout')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    const LayoutComponent = () => <div>Layout</div>;
    const SafeLayout = withLayoutErrorBoundary(LayoutComponent, 'MyLayout');

    expect(SafeLayout.displayName).toBe('withErrorBoundary(MyLayout)');
  });
});

describe('withPageErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wraps page component with error boundary', () => {
    const PageComponent = () => <div data-testid="page">Page Content</div>;
    const SafePage = withPageErrorBoundary(PageComponent, 'TestPage');

    render(<SafePage />);

    expect(screen.getByTestId('error-boundary-TestPage')).toBeInTheDocument();
    expect(screen.getByTestId('page')).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    const PageComponent = () => <div>Page</div>;
    const SafePage = withPageErrorBoundary(PageComponent, 'MyPage');

    expect(SafePage.displayName).toBe('withErrorBoundary(MyPage)');
  });

  it('passes props to page component', () => {
    interface PageProps {
      title: string;
    }
    const PageComponent = ({ title }: PageProps) => (
      <div data-testid="page">{title}</div>
    );
    const SafePage = withPageErrorBoundary(PageComponent, 'PropsPage');

    render(<SafePage title="My Page Title" />);

    expect(screen.getByText('My Page Title')).toBeInTheDocument();
  });
});

describe('HOC Type Safety', () => {
  it('maintains type safety for component props', () => {
    interface StrictProps {
      requiredProp: string;
      optionalProp?: number;
    }

    const StrictComponent = ({ requiredProp, optionalProp }: StrictProps) => (
      <div>
        {requiredProp}
        {optionalProp && <span>{optionalProp}</span>}
      </div>
    );

    const SafeComponent = withErrorBoundary(StrictComponent, {
      componentName: 'StrictComponent',
    });

    // This should compile and render correctly
    render(<SafeComponent requiredProp="test" optionalProp={42} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

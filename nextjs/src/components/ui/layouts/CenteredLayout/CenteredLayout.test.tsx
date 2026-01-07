import React from 'react';
import { render, screen } from '@testing-library/react';
import { CenteredLayout } from './CenteredLayout';

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('CenteredLayout', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(
        <CenteredLayout>
          <div data-testid="child-content">Child Content</div>
        </CenteredLayout>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <CenteredLayout>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </CenteredLayout>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Max Width', () => {
    it('uses medium max-width by default', () => {
      const { container } = render(
        <CenteredLayout>
          <div>Content</div>
        </CenteredLayout>
      );
      const innerWrapper = container.querySelector('.max-w-md');
      expect(innerWrapper).toBeInTheDocument();
    });

    it('applies small max-width', () => {
      const { container } = render(
        <CenteredLayout maxWidth="sm">
          <div>Content</div>
        </CenteredLayout>
      );
      const innerWrapper = container.querySelector('.max-w-sm');
      expect(innerWrapper).toBeInTheDocument();
    });

    it('applies large max-width', () => {
      const { container } = render(
        <CenteredLayout maxWidth="lg">
          <div>Content</div>
        </CenteredLayout>
      );
      const innerWrapper = container.querySelector('.max-w-lg');
      expect(innerWrapper).toBeInTheDocument();
    });

    it('applies xl max-width', () => {
      const { container } = render(
        <CenteredLayout maxWidth="xl">
          <div>Content</div>
        </CenteredLayout>
      );
      const innerWrapper = container.querySelector('.max-w-xl');
      expect(innerWrapper).toBeInTheDocument();
    });

    it('applies 2xl max-width', () => {
      const { container } = render(
        <CenteredLayout maxWidth="2xl">
          <div>Content</div>
        </CenteredLayout>
      );
      const innerWrapper = container.querySelector('.max-w-2xl');
      expect(innerWrapper).toBeInTheDocument();
    });
  });

  describe('Vertical Centering', () => {
    it('centers content vertically by default', () => {
      const { container } = render(
        <CenteredLayout>
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('items-center');
    });

    it('aligns content to start when verticalCenter is false', () => {
      const { container } = render(
        <CenteredLayout verticalCenter={false}>
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('items-start');
      expect(outerWrapper).toHaveClass('pt-20');
    });
  });

  describe('Layout Structure', () => {
    it('has flex layout', () => {
      const { container } = render(
        <CenteredLayout>
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('flex');
    });

    it('has full width and height', () => {
      const { container } = render(
        <CenteredLayout>
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('w-full', 'h-full');
    });

    it('has horizontal centering', () => {
      const { container } = render(
        <CenteredLayout>
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('justify-center');
    });

    it('has padding', () => {
      const { container } = render(
        <CenteredLayout>
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('p-6');
    });

    it('inner wrapper has full width', () => {
      const { container } = render(
        <CenteredLayout>
          <div>Content</div>
        </CenteredLayout>
      );
      const innerWrapper = container.querySelector('.w-full');
      expect(innerWrapper).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CenteredLayout className="custom-class">
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <CenteredLayout className="my-custom-class">
          <div>Content</div>
        </CenteredLayout>
      );
      const outerWrapper = container.firstChild as HTMLElement;
      expect(outerWrapper).toHaveClass('my-custom-class');
      expect(outerWrapper).toHaveClass('flex');
    });

    it('handles empty className', () => {
      const { container } = render(
        <CenteredLayout className="">
          <div>Content</div>
        </CenteredLayout>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('works for login form layout', () => {
      render(
        <CenteredLayout maxWidth="sm">
          <form data-testid="login-form">
            <input placeholder="Email" />
            <input placeholder="Password" type="password" />
            <button type="submit">Login</button>
          </form>
        </CenteredLayout>
      );
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    it('works for empty state', () => {
      render(
        <CenteredLayout>
          <div data-testid="empty-state">
            <h2>No Items Found</h2>
            <p>Start by adding some items</p>
          </div>
        </CenteredLayout>
      );
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('works for error page', () => {
      render(
        <CenteredLayout maxWidth="lg">
          <div data-testid="error-page">
            <h1>404</h1>
            <p>Page Not Found</p>
          </div>
        </CenteredLayout>
      );
      expect(screen.getByTestId('error-page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<CenteredLayout>{null}</CenteredLayout>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles complex nested content', () => {
      render(
        <CenteredLayout>
          <div>
            <header>Header</header>
            <main>
              <section>Section 1</section>
              <section>Section 2</section>
            </main>
            <footer>Footer</footer>
          </div>
        </CenteredLayout>
      );
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });
  });
});

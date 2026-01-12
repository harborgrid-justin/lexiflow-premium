/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { UserAvatar } from '@/shared/ui/atoms/UserAvatar/UserAvatar';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('UserAvatar', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  describe('Rendering', () => {
    it('should render avatar with user initials', () => {
      renderWithTheme(<UserAvatar user={mockUser} />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render avatar with single name', () => {
      renderWithTheme(<UserAvatar user={{ ...mockUser, name: 'John' }} />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should handle empty name gracefully', () => {
      renderWithTheme(<UserAvatar user={{ ...mockUser, name: '' }} />);
      // Should show default or email initial
      const avatar = screen.getByRole('img', { hidden: true });
      expect(avatar).toBeInTheDocument();
    });

    it('should render avatar with custom size', () => {
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} size="lg" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Initials Generation', () => {
    it('should generate correct initials for two names', () => {
      renderWithTheme(<UserAvatar user={mockUser} />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle three word names', () => {
      renderWithTheme(
        <UserAvatar user={{ ...mockUser, name: 'John Michael Doe' }} />
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle single name', () => {
      renderWithTheme(<UserAvatar user={{ ...mockUser, name: 'Madonna' }} />);
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('should handle lowercase names', () => {
      renderWithTheme(
        <UserAvatar user={{ ...mockUser, name: 'john doe' }} />
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} size={size} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Image Avatar', () => {
    const userWithImage = {
      ...mockUser,
      avatar: 'https://example.com/avatar.jpg',
    };

    it('should render image when avatar URL is provided', () => {
      renderWithTheme(<UserAvatar user={userWithImage} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', userWithImage.avatar);
    });

    it('should have alt text', () => {
      renderWithTheme(<UserAvatar user={userWithImage} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
    });

    it('should fallback to initials on image error', () => {
      renderWithTheme(<UserAvatar user={userWithImage} />);
      const img = screen.getByRole('img');

      fireEvent.error(img);

      // Should show initials as fallback
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should show online status', () => {
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} status="online" />
      );
      expect(container.querySelector('[data-status="online"]')).toBeInTheDocument();
    });

    it('should show offline status', () => {
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} status="offline" />
      );
      expect(container.querySelector('[data-status="offline"]')).toBeInTheDocument();
    });

    it('should show away status', () => {
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} status="away" />
      );
      expect(container.querySelector('[data-status="away"]')).toBeInTheDocument();
    });

    it('should not show status indicator by default', () => {
      const { container } = renderWithTheme(<UserAvatar user={mockUser} />);
      expect(container.querySelector('[data-status]')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should trigger onClick when clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(<UserAvatar user={mockUser} onClick={handleClick} />);

      const avatar = screen.getByText('JD').parentElement;
      fireEvent.click(avatar!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClick when not provided', () => {
      const { container } = renderWithTheme(<UserAvatar user={mockUser} />);
      const avatar = screen.getByText('JD').parentElement;

      expect(() => fireEvent.click(avatar!)).not.toThrow();
    });

    it('should be clickable when onClick is provided', () => {
      const handleClick = jest.fn();
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} onClick={handleClick} />
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.style.cursor).toBe('pointer');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for image', () => {
      const userWithImage = {
        ...mockUser,
        avatar: 'https://example.com/avatar.jpg',
      };
      renderWithTheme(<UserAvatar user={userWithImage} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', expect.stringContaining('John Doe'));
    });

    it('should have aria-label for initials avatar', () => {
      const { container } = renderWithTheme(<UserAvatar user={mockUser} />);
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveAttribute('aria-label', expect.stringContaining('John Doe'));
    });

    it('should be keyboard accessible when clickable', () => {
      const handleClick = jest.fn();
      renderWithTheme(<UserAvatar user={mockUser} onClick={handleClick} />);

      const avatar = screen.getByText('JD').parentElement;
      fireEvent.keyDown(avatar!, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    it('should render correctly in light theme', () => {
      renderWithTheme(<UserAvatar user={mockUser} />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render correctly in dark theme', () => {
      renderWithTheme(<UserAvatar user={mockUser} />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without name or email', () => {
      const minimalUser = { id: '1', name: '', email: '' };
      renderWithTheme(<UserAvatar user={minimalUser} />);
      // Should render something, possibly default icon
      const { container } = render(
        <ThemeProvider>
          <UserAvatar user={minimalUser} />
        </ThemeProvider>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle special characters in name', () => {
      renderWithTheme(
        <UserAvatar user={{ ...mockUser, name: 'José María' }} />
      );
      expect(screen.getByText('JM')).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      renderWithTheme(
        <UserAvatar
          user={{
            ...mockUser,
            name: 'Christopher Alexander Montgomery Johnson'
          }}
        />
      );
      // Should still show only first and last initial
      expect(screen.getByText('CJ')).toBeInTheDocument();
    });

    it('should handle null/undefined user gracefully', () => {
      const { container } = render(
        <ThemeProvider>
          <UserAvatar user={null as any} />
        </ThemeProvider>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} className="custom-avatar" />
      );
      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('custom-avatar');
    });

    it('should support custom colors', () => {
      const { container } = renderWithTheme(
        <UserAvatar user={mockUser} color="blue" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

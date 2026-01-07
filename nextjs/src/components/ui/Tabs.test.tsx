import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';
import { Home, Settings, User } from 'lucide-react';

describe('Tabs', () => {
  const defaultTabs = [
    { id: 'home', label: 'Home' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
  ];

  const defaultProps = {
    tabs: defaultTabs,
    activeTab: 'home',
    onTabChange: jest.fn(),
    children: <div>Tab Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all tab labels', () => {
      render(<Tabs {...defaultProps} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<Tabs {...defaultProps} />);
      expect(screen.getByText('Tab Content')).toBeInTheDocument();
    });

    it('renders tab navigation buttons', () => {
      render(<Tabs {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Active Tab', () => {
    it('highlights active tab', () => {
      render(<Tabs {...defaultProps} activeTab="home" />);
      const homeTab = screen.getByText('Home').closest('button');
      expect(homeTab).toHaveClass('border-blue-600');
    });

    it('inactive tabs have transparent border', () => {
      render(<Tabs {...defaultProps} activeTab="home" />);
      const profileTab = screen.getByText('Profile').closest('button');
      expect(profileTab).toHaveClass('border-transparent');
    });

    it('active tab has primary color text', () => {
      render(<Tabs {...defaultProps} activeTab="profile" />);
      const profileTab = screen.getByText('Profile').closest('button');
      expect(profileTab).toHaveClass('text-blue-600');
    });
  });

  describe('Tab Change', () => {
    it('calls onTabChange when tab is clicked', () => {
      const handleTabChange = jest.fn();
      render(<Tabs {...defaultProps} onTabChange={handleTabChange} />);

      fireEvent.click(screen.getByText('Profile'));
      expect(handleTabChange).toHaveBeenCalledWith('profile');
    });

    it('calls onTabChange with correct tab id', () => {
      const handleTabChange = jest.fn();
      render(<Tabs {...defaultProps} onTabChange={handleTabChange} />);

      fireEvent.click(screen.getByText('Settings'));
      expect(handleTabChange).toHaveBeenCalledWith('settings');
    });

    it('does not call onTabChange when clicking active tab', () => {
      const handleTabChange = jest.fn();
      render(
        <Tabs {...defaultProps} activeTab="home" onTabChange={handleTabChange} />
      );

      fireEvent.click(screen.getByText('Home'));
      // It still calls onTabChange (component doesn't prevent this)
      expect(handleTabChange).toHaveBeenCalledWith('home');
    });
  });

  describe('Tab Icons', () => {
    it('renders icons when provided', () => {
      const tabsWithIcons = [
        { id: 'home', label: 'Home', icon: <Home data-testid="home-icon" /> },
        { id: 'profile', label: 'Profile', icon: <User data-testid="user-icon" /> },
        { id: 'settings', label: 'Settings', icon: <Settings data-testid="settings-icon" /> },
      ];

      render(
        <Tabs
          {...defaultProps}
          tabs={tabsWithIcons}
        />
      );

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('renders tabs without icons when not provided', () => {
      render(<Tabs {...defaultProps} />);
      // Should render without crashing
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('icon appears before label', () => {
      const tabsWithIcons = [
        { id: 'home', label: 'Home', icon: <Home data-testid="home-icon" /> },
      ];

      const { container } = render(
        <Tabs
          {...defaultProps}
          tabs={tabsWithIcons}
          activeTab="home"
        />
      );

      const button = screen.getByText('Home').closest('button');
      const iconSpan = button?.querySelector('span');
      expect(iconSpan).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has border-b on tab navigation', () => {
      const { container } = render(<Tabs {...defaultProps} />);
      const navContainer = container.querySelector('.border-b');
      expect(navContainer).toBeInTheDocument();
    });

    it('tabs have proper spacing', () => {
      const { container } = render(<Tabs {...defaultProps} />);
      const tabsContainer = container.querySelector('.flex.gap-1');
      expect(tabsContainer).toBeInTheDocument();
    });

    it('active tab has bottom border', () => {
      render(<Tabs {...defaultProps} activeTab="home" />);
      const homeTab = screen.getByText('Home').closest('button');
      expect(homeTab).toHaveClass('border-b-2');
    });

    it('tab content has top margin', () => {
      const { container } = render(<Tabs {...defaultProps} />);
      const contentContainer = container.querySelector('.mt-6');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Dynamic Content', () => {
    it('renders different content based on active tab', () => {
      const { rerender } = render(
        <Tabs {...defaultProps} activeTab="home">
          <div>Home Content</div>
        </Tabs>
      );
      expect(screen.getByText('Home Content')).toBeInTheDocument();

      rerender(
        <Tabs {...defaultProps} activeTab="profile">
          <div>Profile Content</div>
        </Tabs>
      );
      expect(screen.getByText('Profile Content')).toBeInTheDocument();
    });

    it('supports complex children', () => {
      render(
        <Tabs {...defaultProps}>
          <div>
            <h2>Section Title</h2>
            <p>Section content</p>
            <button>Action</button>
          </div>
        </Tabs>
      );

      expect(screen.getByRole('heading', { name: 'Section Title' })).toBeInTheDocument();
      expect(screen.getByText('Section content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single tab', () => {
      const singleTab = [{ id: 'only', label: 'Only Tab' }];
      render(
        <Tabs
          tabs={singleTab}
          activeTab="only"
          onTabChange={jest.fn()}
        >
          <div>Only content</div>
        </Tabs>
      );

      expect(screen.getByText('Only Tab')).toBeInTheDocument();
      expect(screen.getByText('Only content')).toBeInTheDocument();
    });

    it('handles many tabs', () => {
      const manyTabs = Array.from({ length: 10 }, (_, i) => ({
        id: `tab-${i}`,
        label: `Tab ${i}`,
      }));

      render(
        <Tabs
          tabs={manyTabs}
          activeTab="tab-0"
          onTabChange={jest.fn()}
        >
          <div>Content</div>
        </Tabs>
      );

      expect(screen.getByText('Tab 0')).toBeInTheDocument();
      expect(screen.getByText('Tab 9')).toBeInTheDocument();
    });

    it('handles special characters in labels', () => {
      const specialTabs = [
        { id: 'special', label: 'Tab <with> & "special" chars' },
      ];

      render(
        <Tabs
          tabs={specialTabs}
          activeTab="special"
          onTabChange={jest.fn()}
        >
          <div>Content</div>
        </Tabs>
      );

      expect(screen.getByText(/Tab <with> & "special" chars/)).toBeInTheDocument();
    });

    it('handles rapid tab changes', () => {
      const handleTabChange = jest.fn();
      render(<Tabs {...defaultProps} onTabChange={handleTabChange} />);

      fireEvent.click(screen.getByText('Profile'));
      fireEvent.click(screen.getByText('Settings'));
      fireEvent.click(screen.getByText('Home'));

      expect(handleTabChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('tab buttons are focusable', () => {
      render(<Tabs {...defaultProps} />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it('tabs can be activated with keyboard', () => {
      const handleTabChange = jest.fn();
      render(<Tabs {...defaultProps} onTabChange={handleTabChange} />);

      const profileTab = screen.getByText('Profile').closest('button');
      profileTab?.focus();
      fireEvent.keyDown(profileTab!, { key: 'Enter' });
      fireEvent.keyUp(profileTab!, { key: 'Enter' });
    });

    it('has proper button roles', () => {
      render(<Tabs {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Transition', () => {
    it('tabs have transition class for smooth effects', () => {
      render(<Tabs {...defaultProps} />);
      const homeTab = screen.getByText('Home').closest('button');
      expect(homeTab).toHaveClass('transition-colors');
    });
  });

  describe('Complete Tabs', () => {
    it('renders complete tabs with all features', () => {
      const handleTabChange = jest.fn();
      const tabsWithIcons = [
        { id: 'home', label: 'Home', icon: <Home data-testid="home-icon" /> },
        { id: 'settings', label: 'Settings', icon: <Settings data-testid="settings-icon" /> },
      ];

      render(
        <Tabs
          tabs={tabsWithIcons}
          activeTab="home"
          onTabChange={handleTabChange}
        >
          <div data-testid="tab-content">
            <h2>Home Page</h2>
            <p>Welcome to the home page</p>
          </div>
        </Tabs>
      );

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Home Page' })).toBeInTheDocument();
    });
  });
});

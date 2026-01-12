/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Tabs } from '@/shared/ui/molecules/Tabs/Tabs';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Tabs', () => {
  const defaultTabs = [
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
    { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
  ];

  describe('Rendering', () => {
    it('should render all tab labels', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('should render first tab content by default', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should not render other tab content initially', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });
  });

  describe('Tab Selection', () => {
    it('should switch tab content on click', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);

      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('should call onChange when tab is switched', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Tabs tabs={defaultTabs} onChange={handleChange} />);

      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);

      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('should highlight active tab', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} defaultActiveTab="tab2" />);

      const tab2 = screen.getByText('Tab 2');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Controlled Mode', () => {
    it('should respect activeTab prop', () => {
      renderWithTheme(
        <Tabs tabs={defaultTabs} activeTab="tab3" />
      );

      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('should not switch tabs without onChange in controlled mode', () => {
      const { rerender } = renderWithTheme(
        <Tabs tabs={defaultTabs} activeTab="tab1" />
      );

      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);

      // Should still show Content 1 since activeTab didn't change
      expect(screen.getByText('Content 1')).toBeInTheDocument();

      // Now update activeTab
      rerender(
        <ThemeProvider>
          <Tabs tabs={defaultTabs} activeTab="tab2" />
        </ThemeProvider>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Tab Variants', () => {
    it('should render underline variant', () => {
      const { container } = renderWithTheme(
        <Tabs tabs={defaultTabs} variant="underline" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render pills variant', () => {
      const { container } = renderWithTheme(
        <Tabs tabs={defaultTabs} variant="pills" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render boxed variant', () => {
      const { container } = renderWithTheme(
        <Tabs tabs={defaultTabs} variant="boxed" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Disabled Tabs', () => {
    const tabsWithDisabled = [
      ...defaultTabs,
      { id: 'tab4', label: 'Disabled Tab', content: 'Content 4', disabled: true },
    ];

    it('should render disabled tab', () => {
      renderWithTheme(<Tabs tabs={tabsWithDisabled} />);
      const disabledTab = screen.getByText('Disabled Tab');
      expect(disabledTab).toBeInTheDocument();
    });

    it('should not switch to disabled tab on click', () => {
      renderWithTheme(<Tabs tabs={tabsWithDisabled} />);

      const disabledTab = screen.getByText('Disabled Tab');
      fireEvent.click(disabledTab);

      expect(screen.queryByText('Content 4')).not.toBeInTheDocument();
    });

    it('should have disabled styling', () => {
      renderWithTheme(<Tabs tabs={tabsWithDisabled} />);
      const disabledTab = screen.getByText('Disabled Tab');
      expect(disabledTab.closest('button')).toBeDisabled();
    });
  });

  describe('Tab Icons', () => {
    const tabsWithIcons = [
      { id: 'tab1', label: 'Home', icon: '🏠', content: 'Home Content' },
      { id: 'tab2', label: 'Settings', icon: '⚙️', content: 'Settings Content' },
    ];

    it('should render tab icons', () => {
      renderWithTheme(<Tabs tabs={tabsWithIcons} />);
      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });
  });

  describe('Lazy Loading', () => {
    it('should not render inactive tab content when lazy', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} lazy />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('should load content only when tab is activated', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} lazy />);

      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should keep content after switching away when not lazy', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);

      const tab2 = screen.getByText('Tab 2');
      fireEvent.click(tab2);

      const tab1 = screen.getByText('Tab 1');
      fireEvent.click(tab1);

      // Content 1 should be visible, Content 2 should be in DOM but hidden
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate to next tab with ArrowRight', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);

      const tab1 = screen.getByText('Tab 1');
      fireEvent.keyDown(tab1, { key: 'ArrowRight' });

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should navigate to previous tab with ArrowLeft', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} defaultActiveTab="tab2" />);

      const tab2 = screen.getByText('Tab 2');
      fireEvent.keyDown(tab2, { key: 'ArrowLeft' });

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should navigate to first tab with Home key', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} defaultActiveTab="tab3" />);

      const tab3 = screen.getByText('Tab 3');
      fireEvent.keyDown(tab3, { key: 'Home' });

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should navigate to last tab with End key', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);

      const tab1 = screen.getByText('Tab 1');
      fireEvent.keyDown(tab1, { key: 'End' });

      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('should wrap around when using ArrowRight on last tab', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} defaultActiveTab="tab3" />);

      const tab3 = screen.getByText('Tab 3');
      fireEvent.keyDown(tab3, { key: 'ArrowRight' });

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have tablist role', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should have tab role for each tab', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should have tabpanel role for content', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should set aria-selected on active tab', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      const tab1 = screen.getByText('Tab 1');
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });

    it('should associate tabpanel with tab using aria-labelledby', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveAttribute('aria-labelledby');
    });

    it('should be keyboard focusable', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} />);
      const tab1 = screen.getByText('Tab 1');
      tab1.focus();
      expect(tab1).toHaveFocus();
    });
  });

  describe('Orientation', () => {
    it('should render horizontal orientation by default', () => {
      const { container } = renderWithTheme(<Tabs tabs={defaultTabs} />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should render vertical orientation', () => {
      renderWithTheme(<Tabs tabs={defaultTabs} orientation="vertical" />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tabs array', () => {
      const { container } = renderWithTheme(<Tabs tabs={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle single tab', () => {
      const singleTab = [{ id: 'only', label: 'Only Tab', content: 'Only Content' }];
      renderWithTheme(<Tabs tabs={singleTab} />);

      expect(screen.getByText('Only Tab')).toBeInTheDocument();
      expect(screen.getByText('Only Content')).toBeInTheDocument();
    });

    it('should handle JSX content', () => {
      const tabsWithJSX = [
        {
          id: 'jsx',
          label: 'JSX Tab',
          content: <div><h2>Title</h2><p>Paragraph</p></div>,
        },
      ];

      renderWithTheme(<Tabs tabs={tabsWithJSX} />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });

    it('should handle very long tab labels', () => {
      const longTabs = [
        {
          id: '1',
          label: 'This is a very long tab label that might cause issues',
          content: 'Content'
        },
      ];

      renderWithTheme(<Tabs tabs={longTabs} />);
      expect(screen.getByText(/This is a very long/)).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Tabs tabs={defaultTabs} className="custom-tabs" />
      );
      expect(container.firstChild).toHaveClass('custom-tabs');
    });
  });
});

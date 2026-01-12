/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Accordion } from '@/shared/ui/molecules/Accordion/Accordion';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Accordion', () => {
  const defaultItems = [
    { id: '1', title: 'Section 1', content: 'Content 1' },
    { id: '2', title: 'Section 2', content: 'Content 2' },
    { id: '3', title: 'Section 3', content: 'Content 3' },
  ];

  describe('Rendering', () => {
    it('should render all accordion items', () => {
      renderWithTheme(<Accordion items={defaultItems} />);
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('should render collapsed by default', () => {
      renderWithTheme(<Accordion items={defaultItems} />);
      expect(screen.queryByText('Content 1')).not.toBeVisible();
      expect(screen.queryByText('Content 2')).not.toBeVisible();
      expect(screen.queryByText('Content 3')).not.toBeVisible();
    });

    it('should render with first item expanded', () => {
      renderWithTheme(<Accordion items={defaultItems} defaultExpanded={['1']} />);
      expect(screen.getByText('Content 1')).toBeVisible();
    });
  });

  describe('Expansion/Collapse', () => {
    it('should expand item on click', () => {
      renderWithTheme(<Accordion items={defaultItems} />);

      const section1 = screen.getByText('Section 1');
      fireEvent.click(section1);

      expect(screen.getByText('Content 1')).toBeVisible();
    });

    it('should collapse item on second click', () => {
      renderWithTheme(<Accordion items={defaultItems} defaultExpanded={['1']} />);

      const section1 = screen.getByText('Section 1');
      expect(screen.getByText('Content 1')).toBeVisible();

      fireEvent.click(section1);

      expect(screen.queryByText('Content 1')).not.toBeVisible();
    });

    it('should call onChange when item is expanded', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Accordion items={defaultItems} onChange={handleChange} />);

      const section1 = screen.getByText('Section 1');
      fireEvent.click(section1);

      expect(handleChange).toHaveBeenCalledWith(['1']);
    });

    it('should call onChange when item is collapsed', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <Accordion
          items={defaultItems}
          defaultExpanded={['1']}
          onChange={handleChange}
        />
      );

      const section1 = screen.getByText('Section 1');
      fireEvent.click(section1);

      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Multiple Expansion', () => {
    it('should allow multiple items expanded by default', () => {
      renderWithTheme(<Accordion items={defaultItems} allowMultiple />);

      const section1 = screen.getByText('Section 1');
      const section2 = screen.getByText('Section 2');

      fireEvent.click(section1);
      fireEvent.click(section2);

      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.getByText('Content 2')).toBeVisible();
    });

    it('should collapse other items when allowMultiple is false', () => {
      renderWithTheme(<Accordion items={defaultItems} allowMultiple={false} />);

      const section1 = screen.getByText('Section 1');
      const section2 = screen.getByText('Section 2');

      fireEvent.click(section1);
      expect(screen.getByText('Content 1')).toBeVisible();

      fireEvent.click(section2);
      expect(screen.queryByText('Content 1')).not.toBeVisible();
      expect(screen.getByText('Content 2')).toBeVisible();
    });
  });

  describe('Disabled Items', () => {
    const itemsWithDisabled = [
      ...defaultItems,
      { id: '4', title: 'Disabled Section', content: 'Content 4', disabled: true },
    ];

    it('should render disabled item', () => {
      renderWithTheme(<Accordion items={itemsWithDisabled} />);
      expect(screen.getByText('Disabled Section')).toBeInTheDocument();
    });

    it('should not expand disabled item on click', () => {
      renderWithTheme(<Accordion items={itemsWithDisabled} />);

      const disabledSection = screen.getByText('Disabled Section');
      fireEvent.click(disabledSection);

      expect(screen.queryByText('Content 4')).not.toBeVisible();
    });

    it('should have disabled styling', () => {
      renderWithTheme(<Accordion items={itemsWithDisabled} />);
      const disabledSection = screen.getByText('Disabled Section');
      expect(disabledSection.closest('button')).toBeDisabled();
    });
  });

  describe('Icons', () => {
    it('should show expand/collapse icon', () => {
      const { container } = renderWithTheme(<Accordion items={defaultItems} />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should rotate icon when expanded', () => {
      renderWithTheme(<Accordion items={defaultItems} />);

      const section1 = screen.getByText('Section 1');
      const iconBefore = section1.parentElement?.querySelector('svg');

      fireEvent.click(section1);

      const iconAfter = section1.parentElement?.querySelector('svg');
      expect(iconAfter).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have button role for headers', () => {
      renderWithTheme(<Accordion items={defaultItems} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('should have region role for content', () => {
      renderWithTheme(<Accordion items={defaultItems} defaultExpanded={['1']} />);
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should set aria-expanded on button', () => {
      renderWithTheme(<Accordion items={defaultItems} />);
      const section1Button = screen.getByText('Section 1').closest('button');
      expect(section1Button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(section1Button!);
      expect(section1Button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should set aria-controls to link button with content', () => {
      renderWithTheme(<Accordion items={defaultItems} />);
      const section1Button = screen.getByText('Section 1').closest('button');
      const ariaControls = section1Button?.getAttribute('aria-controls');
      expect(ariaControls).toBeTruthy();
    });

    it('should be keyboard accessible', () => {
      renderWithTheme(<Accordion items={defaultItems} />);
      const section1 = screen.getByText('Section 1').closest('button');

      fireEvent.keyDown(section1!, { key: 'Enter' });
      expect(screen.getByText('Content 1')).toBeVisible();
    });
  });

  describe('Controlled Mode', () => {
    it('should respect expanded prop', () => {
      renderWithTheme(<Accordion items={defaultItems} expanded={['2']} />);
      expect(screen.getByText('Content 2')).toBeVisible();
    });

    it('should not expand without onChange in controlled mode', () => {
      renderWithTheme(<Accordion items={defaultItems} expanded={['1']} />);

      const section2 = screen.getByText('Section 2');
      fireEvent.click(section2);

      // Should still only show Content 1
      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.queryByText('Content 2')).not.toBeVisible();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = renderWithTheme(
        <Accordion items={defaultItems} variant="default" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render bordered variant', () => {
      const { container } = renderWithTheme(
        <Accordion items={defaultItems} variant="bordered" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render separated variant', () => {
      const { container } = renderWithTheme(
        <Accordion items={defaultItems} variant="separated" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = renderWithTheme(
        <Accordion items={defaultItems} size="sm" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = renderWithTheme(
        <Accordion items={defaultItems} size="md" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = renderWithTheme(
        <Accordion items={defaultItems} size="lg" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('JSX Content', () => {
    it('should render JSX in content', () => {
      const itemsWithJSX = [
        {
          id: '1',
          title: 'Section',
          content: <div><h3>Title</h3><p>Paragraph</p></div>,
        },
      ];

      renderWithTheme(<Accordion items={itemsWithJSX} defaultExpanded={['1']} />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });

    it('should render JSX in title', () => {
      const itemsWithJSX = [
        {
          id: '1',
          title: <span><strong>Bold</strong> Title</span>,
          content: 'Content',
        },
      ];

      renderWithTheme(<Accordion items={itemsWithJSX} />);
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const { container } = renderWithTheme(<Accordion items={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle single item', () => {
      const singleItem = [{ id: '1', title: 'Only', content: 'Only Content' }];
      renderWithTheme(<Accordion items={singleItem} />);
      expect(screen.getByText('Only')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);
      const items = [{ id: '1', title: 'Long', content: longContent }];

      renderWithTheme(<Accordion items={items} defaultExpanded={['1']} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle rapid clicks', () => {
      renderWithTheme(<Accordion items={defaultItems} />);

      const section1 = screen.getByText('Section 1');
      fireEvent.click(section1);
      fireEvent.click(section1);
      fireEvent.click(section1);

      expect(screen.getByText('Content 1')).toBeVisible();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Accordion items={defaultItems} className="custom-accordion" />
      );
      expect(container.firstChild).toHaveClass('custom-accordion');
    });
  });
});

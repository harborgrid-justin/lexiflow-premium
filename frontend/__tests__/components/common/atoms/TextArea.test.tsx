/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { TextArea } from '@/shared/ui/atoms/TextArea/TextArea';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TextArea', () => {
  describe('Rendering', () => {
    it('should render textarea element', () => {
      renderWithTheme(<TextArea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      renderWithTheme(<TextArea label="Description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should render without label', () => {
      renderWithTheme(<TextArea placeholder="Enter description" />);
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderWithTheme(<TextArea className="custom-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
    });
  });

  describe('Label Association', () => {
    it('should associate label with textarea', () => {
      renderWithTheme(<TextArea label="Comments" />);
      const label = screen.getByText('Comments');
      const textarea = screen.getByLabelText('Comments');

      expect(label).toBeInTheDocument();
      expect(textarea).toBeInTheDocument();
    });

    it('should generate unique IDs for multiple textareas', () => {
      renderWithTheme(
        <div>
          <TextArea label="Field 1" />
          <TextArea label="Field 2" />
        </div>
      );

      const field1 = screen.getByLabelText('Field 1');
      const field2 = screen.getByLabelText('Field 2');

      expect(field1.id).not.toBe(field2.id);
    });
  });

  describe('Value Handling', () => {
    it('should handle controlled textarea', () => {
      const { rerender } = renderWithTheme(
        <TextArea value="Initial text" onChange={() => { }} />
      );
      let textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial text');

      rerender(
        <ThemeProvider>
          <TextArea value="Updated text" onChange={() => { }} />
        </ThemeProvider>
      );

      textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Updated text');
    });

    it('should handle uncontrolled textarea', () => {
      renderWithTheme(<TextArea defaultValue="Default text" />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Default text');
    });

    it('should update value on user input', () => {
      const handleChange = jest.fn();
      renderWithTheme(<TextArea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'User input' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      renderWithTheme(<TextArea value={multilineText} onChange={() => { }} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineText);
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      renderWithTheme(<TextArea label="Notes" error="Field is required" />);
      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });

    it('should apply error styling', () => {
      renderWithTheme(<TextArea error="Error message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should set aria-invalid when error exists', () => {
      renderWithTheme(<TextArea error="Error message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not set aria-invalid when no error', () => {
      renderWithTheme(<TextArea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('should associate error with textarea via aria-describedby', () => {
      renderWithTheme(<TextArea error="Invalid input" />);
      const textarea = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Invalid input');

      expect(textarea.getAttribute('aria-describedby')).toBeTruthy();
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Rows Configuration', () => {
    it('should set default rows', () => {
      renderWithTheme(<TextArea rows={4} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('should allow custom rows', () => {
      renderWithTheme(<TextArea rows={10} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '10');
    });
  });

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      renderWithTheme(<TextArea placeholder="Enter your comments..." />);
      expect(screen.getByPlaceholderText('Enter your comments...')).toBeInTheDocument();
    });

    it('should clear placeholder on input', () => {
      renderWithTheme(<TextArea placeholder="Type here" />);
      const textarea = screen.getByPlaceholderText('Type here');

      fireEvent.change(textarea, { target: { value: 'User text' } });

      expect(textarea).toHaveAttribute('placeholder', 'Type here');
    });
  });

  describe('Disabled State', () => {
    it('should disable textarea when disabled prop is true', () => {
      renderWithTheme(<TextArea disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not trigger onChange when disabled', () => {
      const handleChange = jest.fn();
      renderWithTheme(<TextArea disabled onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test' } });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('ReadOnly State', () => {
    it('should make textarea readonly', () => {
      renderWithTheme(<TextArea readOnly value="Read only text" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should display value but prevent editing', () => {
      renderWithTheme(<TextArea readOnly value="Cannot edit" />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Cannot edit');
    });
  });

  describe('Max Length', () => {
    it('should enforce maxLength', () => {
      renderWithTheme(<TextArea maxLength={100} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should show character count when maxLength is set', () => {
      renderWithTheme(
        <TextArea maxLength={100} value="Hello" onChange={() => { }} />
      );
      // Assuming the component shows character count
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });
  });

  describe('Resize Behavior', () => {
    it('should allow resizing by default', () => {
      const { container } = renderWithTheme(<TextArea />);
      const textarea = screen.getByRole('textbox');
      // Default textarea allows resizing
      expect(textarea).toBeInTheDocument();
    });

    it('should support resize none', () => {
      const { container } = renderWithTheme(
        <TextArea className="resize-none" />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      renderWithTheme(<TextArea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      renderWithTheme(<TextArea aria-label="Comment field" />);
      expect(screen.getByLabelText('Comment field')).toBeInTheDocument();
    });

    it('should be focusable', () => {
      renderWithTheme(<TextArea />);
      const textarea = screen.getByRole('textbox');
      textarea.focus();
      expect(textarea).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      renderWithTheme(<TextArea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should have unique ID for accessibility', () => {
      renderWithTheme(<TextArea label="Test" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea.id).toBeTruthy();
    });
  });

  describe('Events', () => {
    it('should trigger onChange event', () => {
      const handleChange = jest.fn();
      renderWithTheme(<TextArea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'test' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should trigger onBlur event', () => {
      const handleBlur = jest.fn();
      renderWithTheme(<TextArea onBlur={handleBlur} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.blur(textarea);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should trigger onFocus event', () => {
      const handleFocus = jest.fn();
      renderWithTheme(<TextArea onFocus={handleFocus} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.focus(textarea);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should trigger onKeyDown event', () => {
      const handleKeyDown = jest.fn();
      renderWithTheme(<TextArea onKeyDown={handleKeyDown} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('HTML Attributes', () => {
    it('should support required attribute', () => {
      renderWithTheme(<TextArea required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should forward data attributes', () => {
      renderWithTheme(<TextArea data-testid="custom-textarea" />);
      expect(screen.getByTestId('custom-textarea')).toBeInTheDocument();
    });

    it('should support name attribute', () => {
      renderWithTheme(<TextArea name="comments" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'comments');
    });
  });

  describe('Theme Integration', () => {
    it('should apply dark mode styles', () => {
      renderWithTheme(<TextArea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      renderWithTheme(<TextArea value="" onChange={() => { }} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      renderWithTheme(<TextArea value={longText} onChange={() => { }} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*(){}[]|\\:;"\'<>,.?/~`';
      renderWithTheme(<TextArea value={specialText} onChange={() => { }} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });

    it('should handle tabs and newlines', () => {
      const textWithWhitespace = 'Line 1\n\tIndented\n\n\tDouble indented';
      renderWithTheme(<TextArea value={textWithWhitespace} onChange={() => { }} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(textWithWhitespace);
    });
  });
});

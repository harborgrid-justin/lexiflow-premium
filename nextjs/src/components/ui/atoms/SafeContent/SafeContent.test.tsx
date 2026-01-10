import { render, screen } from '@testing-library/react';
import { SafeContent, TrustedHTML } from './SafeContent';

describe('SafeContent', () => {
  describe('Rendering', () => {
    it('renders with default div element', () => {
      const { container } = render(<SafeContent content="Test content" />);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('renders content as text', () => {
      render(<SafeContent content="Hello World" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders as span when specified', () => {
      const { container } = render(<SafeContent content="Span content" as="span" />);
      expect(container.firstChild?.nodeName).toBe('SPAN');
    });

    it('renders as p when specified', () => {
      const { container } = render(<SafeContent content="Paragraph content" as="p" />);
      expect(container.firstChild?.nodeName).toBe('P');
    });
  });

  describe('Security - XSS Prevention', () => {
    it('treats HTML tags as plain text', () => {
      render(<SafeContent content="<script>alert('xss')</script>" />);
      // The content should be rendered as text, not executed
      expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument();
    });

    it('does not execute script tags', () => {
      const { container } = render(
        <SafeContent content="<script>document.body.innerHTML='hacked'</script>" />
      );
      // Script should not be executed - body should still have our content
      expect(container.textContent).toContain('<script>');
    });

    it('renders HTML entities as plain text', () => {
      render(<SafeContent content="<div>Test</div>" />);
      expect(screen.getByText('<div>Test</div>')).toBeInTheDocument();
    });

    it('safely renders img tags as text', () => {
      render(<SafeContent content="<img src='x' onerror='alert(1)'>" />);
      expect(screen.getByText("<img src='x' onerror='alert(1)'>")).toBeInTheDocument();
    });

    it('safely renders anchor tags as text', () => {
      render(<SafeContent content="<a href='javascript:alert(1)'>Click</a>" />);
      expect(screen.getByText("<a href='javascript:alert(1)'>Click</a>")).toBeInTheDocument();
    });
  });

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SafeContent content="Styled content" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles empty className', () => {
      const { container } = render(
        <SafeContent content="Content" className="" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles undefined className', () => {
      const { container } = render(<SafeContent content="Content" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const { container } = render(<SafeContent content="" />);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild?.textContent).toBe('');
    });

    it('handles whitespace content', () => {
      render(<SafeContent content="   " />);
      expect(screen.getByText('', { selector: 'div' })).toBeInTheDocument();
    });

    it('handles long content', () => {
      const longContent = 'A'.repeat(10000);
      render(<SafeContent content={longContent} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('handles special characters', () => {
      render(<SafeContent content="Special: &amp; &lt; &gt; &quot;" />);
      expect(screen.getByText("Special: &amp; &lt; &gt; &quot;")).toBeInTheDocument();
    });

    it('handles unicode characters', () => {
      render(<SafeContent content="Unicode: \u{1F600} \u{1F44D}" />);
      expect(screen.getByText(/Unicode:/)).toBeInTheDocument();
    });

    it('handles newlines in content', () => {
      render(<SafeContent content="Line 1\nLine 2" />);
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(SafeContent.displayName).toBe('SafeContent');
    });

    it('renders consistently with same props', () => {
      const { rerender, container } = render(
        <SafeContent content="Test" className="test-class" />
      );
      const firstRender = container.innerHTML;

      rerender(<SafeContent content="Test" className="test-class" />);
      const secondRender = container.innerHTML;

      expect(firstRender).toBe(secondRender);
    });
  });
});

describe('TrustedHTML', () => {
  describe('Rendering', () => {
    it('renders with default div element', () => {
      const { container } = render(<TrustedHTML content="Test" />);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('renders as span when specified', () => {
      const { container } = render(<TrustedHTML content="Test" as="span" />);
      expect(container.firstChild?.nodeName).toBe('SPAN');
    });

    it('renders as p when specified', () => {
      const { container } = render(<TrustedHTML content="Test" as="p" />);
      expect(container.firstChild?.nodeName).toBe('P');
    });
  });

  describe('Sanitization', () => {
    it('escapes HTML ampersand', () => {
      const { container } = render(<TrustedHTML content="Tom & Jerry" />);
      expect(container.innerHTML).toContain('&amp;amp;');
    });

    it('escapes less than sign', () => {
      const { container } = render(<TrustedHTML content="5 < 10" />);
      expect(container.innerHTML).toContain('&amp;lt;');
    });

    it('escapes greater than sign', () => {
      const { container } = render(<TrustedHTML content="10 > 5" />);
      expect(container.innerHTML).toContain('&amp;gt;');
    });

    it('escapes double quotes', () => {
      const { container } = render(<TrustedHTML content='Say "Hello"' />);
      expect(container.innerHTML).toContain('&amp;quot;');
    });

    it('escapes single quotes', () => {
      const { container } = render(<TrustedHTML content="It's great" />);
      expect(container.innerHTML).toContain('&#039;');
    });

    it('escapes script tags', () => {
      const { container } = render(
        <TrustedHTML content="<script>alert('xss')</script>" />
      );
      // Script tags should be escaped
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).toContain('&amp;lt;script');
    });

    it('escapes complex XSS attempts', () => {
      const xssContent = '<img src="x" onerror="alert(\'xss\')">';
      const { container } = render(<TrustedHTML content={xssContent} />);
      // Should not have an actual img element
      expect(container.querySelector('img')).toBeNull();
    });
  });

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <TrustedHTML content="Content" className="trusted-class" />
      );
      expect(container.firstChild).toHaveClass('trusted-class');
    });
  });

  describe('dangerouslySetInnerHTML', () => {
    it('uses dangerouslySetInnerHTML internally', () => {
      // This test verifies the component uses innerHTML but with sanitized content
      const { container } = render(<TrustedHTML content="<b>bold</b>" />);
      // The HTML should be escaped, so we won't see an actual <b> element
      expect(container.querySelector('b')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const { container } = render(<TrustedHTML content="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles content with only special characters', () => {
      const { container } = render(<TrustedHTML content={"<>&\"'"} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles multiple escape sequences', () => {
      const content = '<a href="test">Link & More</a>';
      const { container } = render(<TrustedHTML content={content} />);
      // Should not have an actual anchor element
      expect(container.querySelector('a')).toBeNull();
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(TrustedHTML.displayName).toBe('TrustedHTML');
    });
  });
});

describe('Component Comparison', () => {
  it('SafeContent renders text directly, TrustedHTML uses innerHTML', () => {
    const content = 'Simple text';

    const { container: safeContainer } = render(
      <SafeContent content={content} />
    );
    const { container: trustedContainer } = render(
      <TrustedHTML content={content} />
    );

    // Both should render the content
    expect(safeContainer.textContent).toBe(content);
    expect(trustedContainer.textContent).toBe(content);
  });

  it('both components prevent XSS', () => {
    const xssContent = '<script>alert("xss")</script>';

    const { container: safeContainer } = render(
      <SafeContent content={xssContent} />
    );
    const { container: trustedContainer } = render(
      <TrustedHTML content={xssContent} />
    );

    // Neither should have actual script elements
    expect(safeContainer.querySelector('script')).toBeNull();
    expect(trustedContainer.querySelector('script')).toBeNull();
  });
});

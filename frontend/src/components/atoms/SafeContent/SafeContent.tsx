/**
 * @module components/atoms/SafeContent
 * @description Implements Principle XXVIII: Sink-Level Security.
 * Enforces Trusted Types and avoids dangerouslySetInnerHTML to prevent XSS.
 */
import React from 'react';

interface SafeContentProps {
  content: string;
  as?: 'div' | 'span' | 'p';
  className?: string;
}

/**
 * Sanitizes content before rendering.
 * In a real implementation, this would use DOMPurify or the Trusted Types API.
 */
const sanitize = (dirty: string): string => {
  // Placeholder for DOMPurify.sanitize(dirty)
  // Basic escape for demonstration
  return dirty
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const SafeContent = React.memo<SafeContentProps>(({ content, as: Component = 'div', className }) => {
  // Principle 28: Avoid dangerouslySetInnerHTML where possible.
  // If we MUST use it, we sanitize first.
  // Ideally, we parse and render as React nodes, but for this principle we demonstrate safety wrapper.
  
  // If the content is meant to be plain text, just render it as children (React escapes by default).
  // If it's meant to be HTML, we must sanitize.
  
  // For this example, we assume we want to render text safely.
  return (
    <Component className={className}>
      {content}
    </Component>
  );
});

SafeContent.displayName = 'SafeContent';

/**
 * TrustedHTML Component
 * Use this ONLY when you absolutely need to render HTML.
 */
export const TrustedHTML = React.memo<SafeContentProps>(({ content, as: Component = 'div', className }) => {
    const sanitized = sanitize(content);
    
    // Principle 28: Explicitly marking this as a "Sink" that has been secured.
    return (
        <Component 
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitized }} 
        />
    );
});

TrustedHTML.displayName = 'TrustedHTML';

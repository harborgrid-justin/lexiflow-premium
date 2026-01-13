import { render, screen } from '@testing-library/react';
import { Box } from './Box';

describe('Box Atom', () => {
  it('renders children correctly', () => {
    render(<Box>Test Content</Box>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies spacing classes', () => {
    const { container } = render(<Box spacing="lg">Content</Box>);
    expect(container.firstChild).toHaveClass('p-6');
  });

  it('applies background classes', () => {
    const { container } = render(<Box bg="primary">Content</Box>);
    expect(container.firstChild).toHaveClass('bg-blue-600');
  });

  it('applies flex classes', () => {
    const { container } = render(<Box flex direction="col">Content</Box>);
    expect(container.firstChild).toHaveClass('flex', 'flex-col');
  });

  it('applies custom className', () => {
    const { container } = render(<Box className="custom-class">Content</Box>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

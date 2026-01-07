import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </Card>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });
  });

  describe('Styling', () => {
    it('has default card styling', () => {
      const { container } = render(<Card>Styled</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('shadow-sm');
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Custom</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(<Card className="my-class">Merged</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('my-class');
      expect(card).toHaveClass('rounded-lg');
    });
  });

  describe('Hoverable', () => {
    it('does not have hover effect by default', () => {
      const { container } = render(<Card>Not Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('hover:shadow-md');
    });

    it('has hover effect when hoverable is true', () => {
      const { container } = render(<Card hoverable>Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('has transition for hover effect', () => {
      const { container } = render(<Card hoverable>Transition</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('transition-shadow');
    });
  });

  describe('onClick', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Clickable</Card>);
      fireEvent.click(screen.getByText('Clickable'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not require onClick', () => {
      render(<Card>No Click</Card>);
      expect(screen.getByText('No Click')).toBeInTheDocument();
    });

    it('onClick works with hoverable', () => {
      const handleClick = jest.fn();
      render(
        <Card hoverable onClick={handleClick}>
          Clickable Hoverable
        </Card>
      );
      fireEvent.click(screen.getByText('Clickable Hoverable'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Card>{''}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles nested Cards', () => {
      render(
        <Card>
          <Card>Nested Card</Card>
        </Card>
      );
      expect(screen.getByText('Nested Card')).toBeInTheDocument();
    });
  });
});

describe('CardHeader', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('has correct border styling', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('border-b');
    });

    it('has correct padding', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('px-6', 'py-4');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CardHeader className="custom-header">Header</CardHeader>
      );
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('custom-header');
    });
  });
});

describe('CardBody', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<CardBody>Body Content</CardBody>);
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('has correct padding', () => {
      const { container } = render(<CardBody>Body</CardBody>);
      const body = container.firstChild as HTMLElement;
      expect(body).toHaveClass('px-6', 'py-4');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CardBody className="custom-body">Body</CardBody>
      );
      const body = container.firstChild as HTMLElement;
      expect(body).toHaveClass('custom-body');
    });
  });
});

describe('CardFooter', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<CardFooter>Footer Content</CardFooter>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('has correct border styling', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('border-t');
    });

    it('has correct padding', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('px-6', 'py-4');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CardFooter className="custom-footer">Footer</CardFooter>
      );
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('custom-footer');
    });
  });
});

describe('Card Composition', () => {
  it('renders complete card with all parts', () => {
    render(
      <Card>
        <CardHeader>Title</CardHeader>
        <CardBody>Main content here</CardBody>
        <CardFooter>Actions</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Main content here')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders card with only header and body', () => {
    render(
      <Card>
        <CardHeader>Header Only</CardHeader>
        <CardBody>Body Only</CardBody>
      </Card>
    );

    expect(screen.getByText('Header Only')).toBeInTheDocument();
    expect(screen.getByText('Body Only')).toBeInTheDocument();
  });

  it('renders card with just body content', () => {
    render(
      <Card>
        <CardBody>Simple Body</CardBody>
      </Card>
    );

    expect(screen.getByText('Simple Body')).toBeInTheDocument();
  });

  it('maintains proper structure with interactive card', () => {
    const handleClick = jest.fn();
    render(
      <Card hoverable onClick={handleClick}>
        <CardHeader>Interactive</CardHeader>
        <CardBody>Click anywhere</CardBody>
      </Card>
    );

    fireEvent.click(screen.getByText('Interactive'));
    expect(handleClick).toHaveBeenCalled();
  });
});

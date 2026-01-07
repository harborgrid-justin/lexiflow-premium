import { render, screen } from '@testing-library/react';
import { TruncatedText } from './TruncatedText';

describe('TruncatedText Atom', () => {
  it('renders correctly', () => {
    render(<TruncatedText text="Test text" />);
    expect(screen.getByText('Test text')).toBeInTheDocument();
  });

  it('truncates long text', () => {
    const longText = 'This is a very long text that should be truncated after 50 characters by default';
    render(<TruncatedText text={longText} />);
    expect(screen.getByText(/This is a very long text that should be truncated/)).toBeInTheDocument();
  });

  it('does not truncate short text', () => {
    const shortText = 'Short';
    render(<TruncatedText text={shortText} />);
    expect(screen.getByText('Short')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { Play } from 'lucide-react';
import { IconButton } from './IconButton';

describe('IconButton Atom', () => {
  it('renders correctly', () => {
    render(<IconButton icon={Play} aria-label="Play button" />);
    const button = screen.getByRole('button', { name: 'Play button' });
    expect(button).toBeInTheDocument();
  });
});

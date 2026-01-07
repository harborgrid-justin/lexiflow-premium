import { render } from '@testing-library/react';
import { FileIcon } from './FileIcon';

describe('FileIcon Atom', () => {
  it('renders correctly with image type', () => {
    const { container } = render(<FileIcon type="image/png" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correctly with document type', () => {
    const { container } = render(<FileIcon type="application/pdf" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

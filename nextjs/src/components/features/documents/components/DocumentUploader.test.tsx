/**
 * DocumentUploader Component Tests
 * Enterprise-grade test suite for file upload functionality
 *
 * @module components/features/documents/DocumentUploader.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentUploader } from './DocumentUploader';

describe('DocumentUploader', () => {
  const mockOnUpload = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onUpload: mockOnUpload,
    onCancel: mockOnCancel,
  };

  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['mock content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render drop zone', () => {
      render(<DocumentUploader {...defaultProps} />);

      expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
      expect(screen.getByText(/or drag and drop/)).toBeInTheDocument();
    });

    it('should show accepted file types', () => {
      render(<DocumentUploader {...defaultProps} />);

      expect(screen.getByText(/\.pdf, \.doc, \.docx, \.txt, \.xls, \.xlsx/)).toBeInTheDocument();
    });

    it('should show max file size', () => {
      render(<DocumentUploader {...defaultProps} />);

      expect(screen.getByText(/max 50MB per file/)).toBeInTheDocument();
    });

    it('should render metadata form', () => {
      render(<DocumentUploader {...defaultProps} />);

      expect(screen.getByText('Document Information')).toBeInTheDocument();
      expect(screen.getByLabelText('Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should accept files via file input', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const file = createMockFile('test.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('should show file list when files are selected', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const file = createMockFile('document.pdf', 2048, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(screen.getByText('Selected Files (1)')).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('should display file size', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const file = createMockFile('doc.pdf', 1024 * 1024, 'application/pdf'); // 1 MB
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      expect(screen.getByText(/1.*MB/)).toBeInTheDocument();
    });

    it('should allow multiple file selection by default', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} multiple />);

      const files = [
        createMockFile('doc1.pdf', 1024, 'application/pdf'),
        createMockFile('doc2.pdf', 2048, 'application/pdf'),
      ];
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      expect(screen.getByText('Selected Files (2)')).toBeInTheDocument();
      expect(screen.getByText('doc1.pdf')).toBeInTheDocument();
      expect(screen.getByText('doc2.pdf')).toBeInTheDocument();
    });

    it('should limit to single file when multiple is false', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} multiple={false} />);

      const files = [
        createMockFile('doc1.pdf', 1024, 'application/pdf'),
        createMockFile('doc2.pdf', 2048, 'application/pdf'),
      ];
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      expect(screen.getByText('Selected Files (1)')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should highlight drop zone on drag over', () => {
      render(<DocumentUploader {...defaultProps} />);

      const dropZone = screen.getByText(/Click to upload/).closest('div[class*="border-dashed"]');

      fireEvent.dragOver(dropZone!);

      expect(dropZone).toHaveClass('border-blue-500');
    });

    it('should remove highlight on drag leave', () => {
      render(<DocumentUploader {...defaultProps} />);

      const dropZone = screen.getByText(/Click to upload/).closest('div[class*="border-dashed"]');

      fireEvent.dragOver(dropZone!);
      fireEvent.dragLeave(dropZone!);

      expect(dropZone).not.toHaveClass('border-blue-500');
    });

    it('should accept dropped files', () => {
      render(<DocumentUploader {...defaultProps} />);

      const file = createMockFile('dropped.pdf', 1024, 'application/pdf');
      const dropZone = screen.getByText(/Click to upload/).closest('div[class*="border-dashed"]');

      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
        types: ['Files'],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      expect(screen.getByText('dropped.pdf')).toBeInTheDocument();
    });
  });

  describe('Remove File', () => {
    it('should remove file when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const file = createMockFile('remove-me.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);
      expect(screen.getByText('remove-me.pdf')).toBeInTheDocument();

      // Find and click the remove button (X button)
      const removeButton = screen.getByText('remove-me.pdf')
        .closest('div[class*="flex items-center"]')
        ?.querySelector('button');
      await user.click(removeButton!);

      expect(screen.queryByText('remove-me.pdf')).not.toBeInTheDocument();
    });
  });

  describe('Metadata Form', () => {
    it('should allow selecting document type', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const typeSelect = screen.getByLabelText('Type');
      await user.selectOptions(typeSelect, 'Contract');

      expect(typeSelect).toHaveValue('Contract');
    });

    it('should allow selecting status', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const statusSelect = screen.getByLabelText('Status');
      await user.selectOptions(statusSelect, 'Review');

      expect(statusSelect).toHaveValue('Review');
    });

    it('should allow entering description', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const descriptionInput = screen.getByLabelText('Description');
      await user.type(descriptionInput, 'Test description');

      expect(descriptionInput).toHaveValue('Test description');
    });
  });

  describe('Tags', () => {
    it('should add tag when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Add tag...');
      await user.type(tagInput, 'important');
      await user.click(screen.getByText('Add'));

      expect(screen.getByText('important')).toBeInTheDocument();
    });

    it('should add tag when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Add tag...');
      await user.type(tagInput, 'urgent{Enter}');

      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    it('should clear tag input after adding', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Add tag...');
      await user.type(tagInput, 'newtag');
      await user.click(screen.getByText('Add'));

      expect(tagInput).toHaveValue('');
    });

    it('should not add duplicate tags', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Add tag...');
      await user.type(tagInput, 'duplicate');
      await user.click(screen.getByText('Add'));
      await user.type(tagInput, 'duplicate');
      await user.click(screen.getByText('Add'));

      const tags = screen.getAllByText('duplicate');
      expect(tags.length).toBe(1);
    });

    it('should remove tag when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('Add tag...');
      await user.type(tagInput, 'removeme');
      await user.click(screen.getByText('Add'));

      const tag = screen.getByText('removeme');
      const removeButton = tag.closest('span')?.querySelector('button');
      await user.click(removeButton!);

      expect(screen.queryByText('removeme')).not.toBeInTheDocument();
    });
  });

  describe('Upload', () => {
    it('should call onUpload with files and metadata', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const file = createMockFile('upload.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);
      await user.selectOptions(screen.getByLabelText('Type'), 'Contract');
      await user.selectOptions(screen.getByLabelText('Status'), 'Final');

      await user.click(screen.getByText(/Upload 1 File/));

      expect(mockOnUpload).toHaveBeenCalledWith(
        [expect.any(File)],
        expect.objectContaining({
          type: 'Contract',
          status: 'Final',
          tags: [],
        })
      );
    });

    it('should disable upload button when no files selected', () => {
      render(<DocumentUploader {...defaultProps} />);

      const uploadButton = screen.getByText(/Upload 0 Files/);
      expect(uploadButton).toBeDisabled();
    });

    it('should show correct file count in upload button', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const files = [
        createMockFile('doc1.pdf', 1024, 'application/pdf'),
        createMockFile('doc2.pdf', 2048, 'application/pdf'),
      ];
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      expect(screen.getByText('Upload 2 Files')).toBeInTheDocument();
    });

    it('should show uploading state during upload', async () => {
      const slowUpload = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} onUpload={slowUpload} />);

      const file = createMockFile('upload.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);
      await user.click(screen.getByText(/Upload 1 File/));

      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('should reset form after successful upload', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      const file = createMockFile('upload.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);
      await user.click(screen.getByText(/Upload 1 File/));

      await waitFor(() => {
        expect(screen.queryByText('upload.pdf')).not.toBeInTheDocument();
      });
    });

    it('should handle upload error gracefully', async () => {
      const failingUpload = jest.fn().mockRejectedValue(new Error('Upload failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();

      render(<DocumentUploader {...defaultProps} onUpload={failingUpload} />);

      const file = createMockFile('upload.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);
      await user.click(screen.getByText(/Upload 1 File/));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Upload failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Cancel', () => {
    it('should render cancel button when onCancel is provided', () => {
      render(<DocumentUploader {...defaultProps} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      const propsWithoutCancel = { onUpload: mockOnUpload };
      render(<DocumentUploader {...propsWithoutCancel} />);

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} />);

      await user.click(screen.getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should disable cancel button while uploading', async () => {
      const slowUpload = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} onUpload={slowUpload} />);

      const file = createMockFile('upload.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);
      await user.click(screen.getByText(/Upload 1 File/));

      expect(screen.getByText('Cancel')).toBeDisabled();
    });
  });

  describe('Case ID', () => {
    it('should include caseId in metadata when provided', async () => {
      const user = userEvent.setup();
      render(<DocumentUploader {...defaultProps} caseId="case-123" />);

      const file = createMockFile('case-doc.pdf', 1024, 'application/pdf');
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);
      await user.click(screen.getByText(/Upload 1 File/));

      expect(mockOnUpload).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ caseId: 'case-123' })
      );
    });
  });

  describe('Accepted Types', () => {
    it('should use custom accepted types when provided', () => {
      render(<DocumentUploader {...defaultProps} acceptedTypes={['.pdf', '.docx']} />);

      expect(screen.getByText(/\.pdf, \.docx/)).toBeInTheDocument();
    });
  });
});

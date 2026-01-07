/**
 * @fileoverview Enterprise-grade tests for EnterpriseBrandingConfig component
 * Tests branding configuration, preview functionality, and form handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EnterpriseBrandingConfig, type BrandingConfig } from './EnterpriseBrandingConfig';

expect.extend(toHaveNoViolations);

describe('EnterpriseBrandingConfig', () => {
  const mockInitialConfig: BrandingConfig = {
    logoUrl: 'https://example.com/logo.png',
    logoWidth: 200,
    logoHeight: 60,
    primaryColor: '#3B82F6',
    buttonColor: '#2563EB',
    backgroundColor: '#F9FAFB',
    title: 'Welcome to Company',
    welcomeMessage: 'Sign in to access your account',
    companyName: 'Test Company',
    supportEmail: 'support@company.com',
    supportUrl: 'https://support.company.com'
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByText('Login Branding')).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByText(/customize the appearance/i)).toBeInTheDocument();
    });

    it('renders preview toggle button', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByRole('button', { name: /show preview/i })).toBeInTheDocument();
    });

    it('renders save changes button', () => {
      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('renders reset button', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByRole('button', { name: /reset to default/i })).toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      render(<EnterpriseBrandingConfig onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<EnterpriseBrandingConfig className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Logo Section', () => {
    it('displays logo section heading', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByText('Logo')).toBeInTheDocument();
    });

    it('renders logo URL input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/logo url/i)).toBeInTheDocument();
    });

    it('renders logo width input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/width \(px\)/i)).toBeInTheDocument();
    });

    it('renders logo height input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/height \(px\)/i)).toBeInTheDocument();
    });

    it('populates logo fields with initial config', () => {
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      expect(screen.getByLabelText(/logo url/i)).toHaveValue('https://example.com/logo.png');
      expect(screen.getByLabelText(/width \(px\)/i)).toHaveValue(200);
      expect(screen.getByLabelText(/height \(px\)/i)).toHaveValue(60);
    });
  });

  describe('Colors Section', () => {
    it('displays colors section heading', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByText('Colors')).toBeInTheDocument();
    });

    it('renders primary color input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument();
    });

    it('renders button color input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/button color/i)).toBeInTheDocument();
    });

    it('renders background color input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/background color/i)).toBeInTheDocument();
    });

    it('renders color picker inputs', () => {
      render(<EnterpriseBrandingConfig />);

      const colorInputs = document.querySelectorAll('input[type="color"]');
      expect(colorInputs.length).toBe(3);
    });

    it('populates color fields with initial config', () => {
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      expect(screen.getByLabelText(/primary color/i)).toHaveValue('#3B82F6');
      expect(screen.getByLabelText(/button color/i)).toHaveValue('#2563EB');
      expect(screen.getByLabelText(/background color/i)).toHaveValue('#F9FAFB');
    });
  });

  describe('Content Section', () => {
    it('displays content section heading', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders page title input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/page title/i)).toBeInTheDocument();
    });

    it('renders welcome message textarea', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/welcome message/i)).toBeInTheDocument();
    });

    it('renders company name input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    });

    it('populates content fields with initial config', () => {
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      expect(screen.getByLabelText(/page title/i)).toHaveValue('Welcome to Company');
      expect(screen.getByLabelText(/welcome message/i)).toHaveValue('Sign in to access your account');
      expect(screen.getByLabelText(/company name/i)).toHaveValue('Test Company');
    });
  });

  describe('Support Section', () => {
    it('displays support section heading', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('renders support email input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/support email/i)).toBeInTheDocument();
    });

    it('renders support URL input', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/support url/i)).toBeInTheDocument();
    });

    it('populates support fields with initial config', () => {
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      expect(screen.getByLabelText(/support email/i)).toHaveValue('support@company.com');
      expect(screen.getByLabelText(/support url/i)).toHaveValue('https://support.company.com');
    });
  });

  describe('Preview Panel', () => {
    it('hides preview by default', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });

    it('shows preview when toggle clicked', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('toggles preview button text', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByRole('button', { name: /show preview/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      expect(screen.getByRole('button', { name: /hide preview/i })).toBeInTheDocument();
    });

    it('shows logo in preview when logoUrl provided', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      const previewLogo = screen.getByAltText('Company Logo');
      expect(previewLogo).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('shows title in preview', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      expect(screen.getByText('Welcome to Company')).toBeInTheDocument();
    });

    it('shows welcome message in preview', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      expect(screen.getByText('Sign in to access your account')).toBeInTheDocument();
    });

    it('shows company name in preview footer', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      expect(screen.getByText(/Test Company/)).toBeInTheDocument();
    });

    it('applies button color to preview button', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).toHaveStyle({ backgroundColor: '#2563EB' });
    });
  });

  describe('Form Interactions', () => {
    it('updates config on input change', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      await user.type(screen.getByLabelText(/page title/i), 'New Title');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'New Title' })
        );
      });
    });

    it('updates color via text input', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      const primaryColorInput = screen.getByLabelText(/primary color/i);
      await user.clear(primaryColorInput);
      await user.type(primaryColorInput, '#FF0000');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ primaryColor: '#FF0000' })
        );
      });
    });

    it('updates logo dimensions', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      const widthInput = screen.getByLabelText(/width \(px\)/i);
      await user.clear(widthInput);
      await user.type(widthInput, '300');
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ logoWidth: 300 })
        );
      });
    });
  });

  describe('Save Functionality', () => {
    it('calls onSave with config on save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(mockInitialConfig);
      });
    });

    it('shows saving state during save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('disables save button during save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });
  });

  describe('Reset Functionality', () => {
    it('resets to initial config on reset click', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      // Change a value
      const titleInput = screen.getByLabelText(/page title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Changed Title');

      expect(titleInput).toHaveValue('Changed Title');

      // Reset
      await user.click(screen.getByRole('button', { name: /reset to default/i }));

      expect(titleInput).toHaveValue('Welcome to Company');
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<EnterpriseBrandingConfig onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('disables cancel button during save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<EnterpriseBrandingConfig onSave={mockOnSave} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error on save failure', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('Failed to save configuration'));

      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to save configuration/i)).toBeInTheDocument();
      });
    });

    it('shows error in alert role', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(<EnterpriseBrandingConfig onSave={mockOnSave} />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Default Values', () => {
    it('uses default logo dimensions when not specified', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/width \(px\)/i)).toHaveValue(200);
      expect(screen.getByLabelText(/height \(px\)/i)).toHaveValue(60);
    });

    it('uses default colors when not specified', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/primary color/i)).toHaveValue('#3B82F6');
      expect(screen.getByLabelText(/button color/i)).toHaveValue('#2563EB');
      expect(screen.getByLabelText(/background color/i)).toHaveValue('#F9FAFB');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<EnterpriseBrandingConfig />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with preview open', async () => {
      const user = userEvent.setup();
      const { container } = render(<EnterpriseBrandingConfig initialConfig={mockInitialConfig} />);

      await user.click(screen.getByRole('button', { name: /show preview/i }));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Login Branding');
      expect(screen.getByRole('heading', { level: 3, name: /logo/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /colors/i })).toBeInTheDocument();
    });

    it('has proper form labels', () => {
      render(<EnterpriseBrandingConfig />);

      expect(screen.getByLabelText(/logo url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/page title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/support email/i)).toBeInTheDocument();
    });
  });
});

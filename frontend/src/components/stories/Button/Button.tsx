import './button.css';
import { useTheme } from '@/theme';

export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** What background color to use */
  backgroundColor?: string;
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large';
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
}

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const { theme } = useTheme();

  const baseStyles = {
    display: 'inline-block',
    cursor: 'pointer',
    border: 0,
    borderRadius: '3em',
    fontWeight: 700,
    lineHeight: 1,
    fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  };

  const sizeStyles = {
    small: { padding: '10px 16px', fontSize: '12px' },
    medium: { padding: '11px 20px', fontSize: '14px' },
    large: { padding: '12px 24px', fontSize: '16px' },
  };

  const variantStyles = primary
    ? {
      backgroundColor: backgroundColor || theme.primary.DEFAULT,
      color: theme.text.inverse
    }
    : {
      boxShadow: 'rgba(0, 0, 0, 0.15) 0 0 0 1px inset',
      backgroundColor: backgroundColor || 'transparent',
      color: theme.text.primary
    };

  return (
    <button
      type="button"
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles }}
      {...props}
    >
      {label}
    </button>
  );
};

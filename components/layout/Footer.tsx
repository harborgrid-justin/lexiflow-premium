/**
 * Footer Component
 * Application footer with links and copyright
 */

import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { Github, Twitter, Mail, ExternalLink } from 'lucide-react';

interface FooterProps {
  showSocial?: boolean;
  showLinks?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  showSocial = true,
  showLinks = true,
  className,
}) => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Mail, label: 'Email', href: 'mailto:contact@lexiflow.ai' },
  ];

  const footerLinks = [
    { label: 'About', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Support', href: '#' },
  ];

  return (
    <footer
      className={cn(
        'py-6 px-4 border-t',
        theme.surface.secondary,
        theme.border.default,
        className
      )}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section - Copyright */}
          <div className={cn('text-sm', theme.text.secondary)}>
            <p>
              &copy; {currentYear} LexiFlow AI Legal Suite. All rights reserved.
            </p>
          </div>

          {/* Center Section - Links */}
          {showLinks && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {footerLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={cn(
                    'text-sm transition-colors inline-flex items-center gap-1',
                    theme.text.secondary,
                    'hover:text-blue-600 dark:hover:text-blue-400'
                  )}
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}

          {/* Right Section - Social */}
          {showSocial && (
            <div className="flex items-center gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    theme.text.secondary,
                    `hover:${theme.surface.highlight}`,
                    'hover:text-blue-600 dark:hover:text-blue-400'
                  )}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className={cn('mt-4 pt-4 border-t text-center', theme.border.default)}>
          <p className={cn('text-xs', theme.text.tertiary)}>
            LexiFlow is an AI-powered legal practice management suite designed for modern law firms.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

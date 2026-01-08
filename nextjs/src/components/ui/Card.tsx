'use client';

/**
 * @deprecated Use @/components/ui/shadcn/card instead
 * Adapter component for backward compatibility
 */

import { 
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
  CardTitle,
  CardDescription
} from '@/components/ui/shadcn/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <ShadcnCard
      onClick={onClick}
      className={cn(
        hoverable && "hover:shadow-md transition-shadow cursor-pointer",
        className
      )}
    >
      {children}
    </ShadcnCard>
  );
}

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: WrapperProps) {
  return (
    <ShadcnCardHeader className={className}>
      {children}
    </ShadcnCardHeader>
  );
}

export const CardBody = ({ children, className = '' }: WrapperProps) => {
  return (
    <ShadcnCardContent className={cn("pt-0", className)}>
      {children}
    </ShadcnCardContent>
  );
}

export function CardFooter({ children, className = '' }: WrapperProps) {
  return (
    <ShadcnCardFooter className={className}>
      {children}
    </ShadcnCardFooter>
  );
}

// Re-export new components for progressive adoption
export { CardTitle, CardDescription };

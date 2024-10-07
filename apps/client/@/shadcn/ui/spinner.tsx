import React from 'react';
import { cn } from '../../lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva('animate-spin', {
  variants: {
    size: {
      small: 'w-6 h-6',    // Updated size classes for small
      medium: 'w-12 h-12', // Updated size classes for medium
      large: 'w-24 h-24',  // Updated size classes for large
    },
    color: {
      primary: 'text-primary',
      white: 'text-white',   // Add more color options
      black: 'text-black',
      contrast: 'text-red-500',  // Example of a high-contrast color
    },
  },
  defaultVariants: {
    size: 'medium',
    color: 'primary',
  },
});

interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
}

export function Spinner({ size, show, color, children, className }: SpinnerContentProps) {
  return (
    <span className={spinnerVariants({ show })}>
      <Loader2 className={cn(loaderVariants({ size, color }), className)} />
      {children}
    </span>
  );
}

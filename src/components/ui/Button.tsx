import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * ボタンのバリエーションを定義
 */
const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow-md shadow-blue-600/25 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/35',
        destructive: 'bg-red-600 text-white shadow-md shadow-red-600/25 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/35',
        outline: 'border border-slate-300 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-100 hover:border-slate-400',
        secondary: 'bg-slate-200 text-slate-900 hover:-translate-y-0.5 hover:bg-slate-300',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        link: 'bg-transparent text-blue-700 underline-offset-4 hover:underline hover:bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * ボタンコンポーネントのプロパティ
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * ボタンコンポーネント
 * 様々なスタイルとサイズのボタンを提供
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    void asChild;
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

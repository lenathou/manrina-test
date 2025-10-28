import { cn } from '@/lib/utils';
import { FC, HTMLAttributes, createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Image from 'next/image';

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog component');
  }
  return context;
};

interface DialogProps {
  children: ReactNode;
}

export const Dialog: FC<DialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export const DialogTrigger: FC<DialogTriggerProps> = ({
  asChild,
  children,
  ...props
}) => {
  const { setOpen } = useDialog();

  if (asChild) {
    return (
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
    );
  }

  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
};

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DialogContent: FC<DialogContentProps> = ({
  children,
  className,
  ...props
}) => {
  const { open, setOpen } = useDialog();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Fermer la boîte de dialogue"
      />
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto',
          className
        )}
        {...props}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Fermer la boîte de dialogue"
        >
          <Image src="/icons/close.svg" alt="Fermer" width={20} height={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DialogHeader: FC<DialogHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const DialogTitle: FC<DialogTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  );
};
import { cn } from '@/lib/utils';
import { FC, HTMLAttributes, createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AlertDialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within an AlertDialog component');
  }
  return context;
};

interface AlertDialogProps {
  children: ReactNode;
}

export const AlertDialog: FC<AlertDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

interface AlertDialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export const AlertDialogTrigger: FC<AlertDialogTriggerProps> = ({
  asChild,
  children,
  ...props
}) => {
  const { setOpen } = useAlertDialog();

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

interface AlertDialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AlertDialogContent: FC<AlertDialogContentProps> = ({
  children,
  className,
  ...props
}) => {
  const { open, setOpen } = useAlertDialog();

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
          'relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AlertDialogHeader: FC<AlertDialogHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-center sm:text-left p-6 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface AlertDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const AlertDialogTitle: FC<AlertDialogTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h2
      className={cn('text-lg font-semibold', className)}
      {...props}
    >
      {children}
    </h2>
  );
};

interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const AlertDialogDescription: FC<AlertDialogDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn('text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  );
};

interface AlertDialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AlertDialogFooter: FC<AlertDialogFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface AlertDialogActionProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const AlertDialogAction: FC<AlertDialogActionProps> = ({
  children,
  className,
  ...props
}) => {
  const { setOpen } = useAlertDialog();

  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
};

interface AlertDialogCancelProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const AlertDialogCancel: FC<AlertDialogCancelProps> = ({
  children,
  className,
  ...props
}) => {
  const { setOpen } = useAlertDialog();

  return (
    <button
      className={cn(
        'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0',
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
};
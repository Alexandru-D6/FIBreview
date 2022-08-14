import { CheckCircleIcon, XIcon, XCircleIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

interface AlertProps {
  variant: 'success' | 'failure';
  onDismiss: () => void;
  children: React.ReactNode;
}

export default function Alert({ variant, children, onDismiss }: AlertProps): JSX.Element {
  return (
    <div className={classNames({
      'bg-red-50': variant === 'failure',
      'bg-green-50': variant === 'success',
    }, 'rounded-md p-4 my-4')}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          { variant === 'success'
            ? <CheckCircleIcon className="text-green-400 h-5 w-5" />
            : <XCircleIcon className="text-red-400 h-5 w-5" />}
        </div>
        <div className={classNames({
          'text-green-800': variant === 'success',
          'text-red-800': variant === 'failure',
        }, 'ml-3')}
        >
          { children }
        </div>
        <div className="ml-auto self-start pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onDismiss}
              className={classNames({
                'bg-green-50 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600': variant === 'success',
                'bg-red-50 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600': variant === 'failure',
              }, 'inline-flex rounded-md p-1.5')}
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
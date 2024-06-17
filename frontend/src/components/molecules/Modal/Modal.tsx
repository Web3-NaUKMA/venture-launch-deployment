import { FC, HTMLAttributes, ReactNode, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import { useOutsideClick } from '../../../hooks/dom.hooks';
import { CloseIcon } from '../../atoms/Icons/Icons';

export interface ModalProps extends HTMLAttributes<HTMLElement> {
  title: string;
  onClose?: (...args: any[]) => any;
  onProcess?: (...args: any[]) => any;
  children?: ReactNode | ReactNode[];
}

const Modal: FC<ModalProps> = ({ children, title, onClose, className }) => {
  const modalRef = useOutsideClick(() => onClose?.());

  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      body.style.overflow = 'hidden';

      return () => {
        body.style.overflow = 'auto';
      };
    }
  }, []);

  return (
    <div
      tabIndex={-1}
      className='overflow-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full max-h-screen bg-neutral-900 bg-opacity-50'
    >
      <div
        ref={modalRef}
        className={`modal left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 relative py-10 flex flex-1 w-full ${className}`}
      >
        <div className='max-h-[calc(100vh-2.5rem)] w-full flex flex-col relative bg-white rounded-lg shadow m-5'>
          <div className='flex items-center justify-between px-10 py-6 border-b rounded-t border-neutral-300'>
            <h3 className={`text-[22px] sm:text-[26px] font-medium text-gray-900 font-serif`}>
              {title}
            </h3>
            <Button
              type='button'
              className='text-neutral-600 bg-transparent rounded-lg ms-auto inline-flex justify-center p-2 hover:bg-gray-100 hover:text-gray-900 items-center'
              onClick={onClose}
            >
              <CloseIcon className='stroke-2 size-4' />
              <span className='sr-only'>Close modal</span>
            </Button>
          </div>
          <div className='space-y-4 overflow-y-auto relative with-scrollbar'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

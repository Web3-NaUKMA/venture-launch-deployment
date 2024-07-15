import { FC, useState } from 'react';
import Button, { ButtonProps } from '../Button/Button';
import { ChevronDownIcon } from '../Icons/Icons';

export interface AccordionButtonProps extends ButtonProps {}
export interface AccordionButtonState {
  isActive: boolean;
}

const initialState: AccordionButtonState = {
  isActive: false,
};

const AccordionButton: FC<AccordionButtonProps> = ({ onClick, children, ...props }) => {
  const [state, setState] = useState(initialState);

  return (
    <Button
      type='button'
      className='bg-stone-200 rounded-xl p-2 text-stone-600 hover:bg-stone-300 transition-all duration-300'
      {...props}
      onClick={event => {
        onClick?.(event);
        setState({ ...state, isActive: !state.isActive });
      }}
    >
      <ChevronDownIcon
        className={`size-6 transition-transform duration-300 ${state.isActive ? '-rotate-180' : ''}`}
      />
      {children}
    </Button>
  );
};

export default AccordionButton;

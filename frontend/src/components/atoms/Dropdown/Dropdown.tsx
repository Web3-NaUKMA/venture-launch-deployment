import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { ArrowDropDown } from '../Icons/Icons';
import { useOutsideClick } from 'hooks/dom.hooks';

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  onValueChanged?: (value: string) => void;
  options: { name: string; value: string }[];
  defaultValue?: string;
}

export interface DropdownState {
  active: boolean;
  value: string;
}

const initialState: DropdownState = {
  active: false,
  value: '',
};

const Dropdown: FC<DropdownProps> = ({ onValueChanged, options, defaultValue, ...props }) => {
  const [state, setState] = useState(initialState);
  const ref = useOutsideClick(() => setState({ ...state, active: false }));

  useEffect(() => {
    setState({
      ...state,
      value: defaultValue === undefined ? options[0]?.value || '' : defaultValue,
    });
  }, [defaultValue]);

  return (
    <div
      className='flex items-center gap-1 cursor-pointer relative'
      {...props}
      onClick={() => setState({ ...state, active: !state.active })}
      ref={ref}
    >
      <p className='font-mono text-xs'>
        {options.find(option => option.value === state.value)?.name}
      </p>
      <ArrowDropDown className='size-4 text-stone-600 mt-0.5' />
      {state.active && (
        <div className='flex gap-1 text-xs p-2 flex-col absolute left-0 -right-1/2 bg-white rounded-lg mt-2 top-full shadow-[0_0_15px_-7px_grey]'>
          {options.map((option, index) => (
            <span
              className='hover:bg-stone-100 rounded px-2 py-0.5 font-mono transition-all duration-300'
              key={index}
              onClick={event => {
                event.stopPropagation();
                setState({ ...state, value: option.value, active: false });
                onValueChanged?.(option.value);
              }}
            >
              {option.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

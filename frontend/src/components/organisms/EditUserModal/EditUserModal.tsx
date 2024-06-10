import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { IModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { selectErrors, setError, updateUser } from '../../../redux/slices/user.slice';
import { IUpdateUser, IUser } from '../../../types/user.types';

export interface IEditUserModalProps extends IModalProps {
  user: IUser;
}

interface IEditUserModalState {
  data: {
    username?: string;
    email?: string;
  };
  error: string | null;
}

const initialState: IEditUserModalState = {
  data: {
    username: undefined,
    email: undefined,
  },
  error: null,
};

const EditUserModal: FC<IEditUserModalProps> = ({ user, title, onClose, onProcess, children }) => {
  const [state, setState] = useState({
    ...initialState,
    data: {
      ...initialState.data,
      username: user.username,
      email: user.email,
    },
  });
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);

  useEffect(() => {
    dispatch(setError({ updateUser: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.updateUser });
  }, [errors.updateUser]);

  const isDataValid = (data: IEditUserModalState['data']): boolean => {
    if (!data.username?.trim()) {
      setState({ ...state, error: 'Username cannot be empty.' });
      return false;
    }

    if (!data.email?.trim()) {
      setState({ ...state, error: 'User email cannot be empty.' });
      return false;
    }

    return true;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data)) {
      dispatch(
        updateUser(user.id, state.data as IUpdateUser, {
          onSuccess: () => onProcess?.(),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[768px]'>
      <form ref={formRef} className='flex flex-col px-10 py-8 gap-5' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-3 font-mono text-sm'>
            {state.error}
          </span>
        )}
        <div className='flex flex-col'>
          <label
            htmlFor='update_user_username'
            className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
          >
            Username
          </label>
          <input
            type='text'
            id='update_user_username'
            placeholder='username'
            className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-600 font-mono'
            defaultValue={state.data.username}
            onChange={event =>
              setState({
                ...state,
                data: { ...state.data, username: event.target.value },
                error: null,
              })
            }
          />
        </div>
        <div className='flex flex-col'>
          <label
            htmlFor='update_user_email'
            className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
          >
            Email
          </label>
          <input
            id='update_user_email'
            type='email'
            placeholder='aboba@gmail.com'
            className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-600 font-mono'
            defaultValue={state.data.email}
            onChange={event =>
              setState({
                ...state,
                data: { ...state.data, email: event.target.value },
                error: null,
              })
            }
          />
        </div>
        <div className='mt-9 flex gap-4'>
          <button
            type='submit'
            className='inline-flex text-center justify-center items-center bg-zinc-900 border-2 border-transparent hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
          >
            Save changes
          </button>
          <button
            type='button'
            className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
      {children}
    </Modal>
  );
};

export default EditUserModal;

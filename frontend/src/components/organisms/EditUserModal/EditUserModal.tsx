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

const EditUserModal: FC<IEditUserModalProps> = ({ user, title, buttons, children }) => {
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
          onSuccess: () => buttons?.find(button => button.type === 'accept')?.action(),
        }),
      );
    }
  };

  return (
    <Modal
      title={title}
      buttons={buttons?.map(button =>
        button.type === 'accept'
          ? {
              ...button,
              action: () => {
                if (formRef.current && formRef.current instanceof HTMLFormElement) {
                  formRef.current.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true }),
                  );
                }
              },
            }
          : button,
      )}
      className='max-w-[768px]'
    >
      <form ref={formRef} className='flex flex-col' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-5'>
            {state.error}
          </span>
        )}
        <label htmlFor='update_user_username' className='mb-1'>
          Username:
        </label>
        <input
          type='text'
          id='update_user_username'
          className='border p-2 rounded-md mb-5'
          defaultValue={state.data.username}
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, username: event.target.value },
              error: null,
            })
          }
        />
        <label htmlFor='update_user_email' className='mb-1'>
          Email:
        </label>
        <input
          id='update_user_email'
          type='email'
          className='border p-2 rounded-md'
          defaultValue={state.data.email}
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, email: event.target.value },
              error: null,
            })
          }
        />
      </form>
      {children}
    </Modal>
  );
};

export default EditUserModal;

import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { selectErrors, setError, updateUser } from '../../../redux/slices/user.slice';
import { User } from '../../../types/user.types';
import { UserIcon } from '../../atoms/Icons/Icons';
import { resolveImage } from '../../../utils/file.utils';
import Spinner from 'components/atoms/Spinner/Spinner';

export interface EditUserModalProps extends ModalProps {
  user: User;
}

interface EditUserModalState {
  data: {
    username?: string;
    email?: string;
    bio?: string | null;
    avatar?: File | null;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: EditUserModalState = {
  data: {
    username: undefined,
    email: undefined,
  },
  isLoading: false,
  error: null,
};

const EditUserModal: FC<EditUserModalProps> = ({ user, title, onClose, onProcess, children }) => {
  const [state, setState] = useState({
    ...initialState,
    data: {
      ...initialState.data,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      bio: user.bio,
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

  const isDataValid = (data: EditUserModalState['data']): boolean => {
    if (data.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
      setState({ ...state, error: 'Email must have the following format: example@gmail.com' });
      return false;
    }

    if (data.firstName && !/^\w+$/.test(data.firstName)) {
      setState({
        ...state,
        error: 'First name cannot be empty and must contain only latin letters',
      });
      return false;
    }

    if (data.lastName && !/^\w+$/.test(data.lastName)) {
      setState({
        ...state,
        error: 'Last name cannot be empty and must contain only latin letters',
      });
      return false;
    }

    if (data.username && !/^(\d|\w)+$/.test(data.username)) {
      setState({
        ...state,
        error: 'Username cannot be empty and must contain only latin letters, digits or underscore',
      });
      return false;
    }

    if (
      data.password &&
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\.])[A-Za-z\d@$!%*#?&_=\-+\.]{8,}$/.test(data.password)
    ) {
      setState({
        ...state,
        error:
          'The password must be minimum 8 characters long and contain at least one latin letter, one digit and one special symbol',
      });
      return false;
    }

    return true;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data)) {
      setState({ ...state, isLoading: true });
      const formData = new FormData(event.target as any);
      formData.delete('user-avatar');

      if (state.data.avatar) {
        formData.append('user-avatar', state.data.avatar);
      }

      Object.entries(state.data).forEach(([key, value]: [string, any]) => {
        if (value === null || value === '') {
          formData.append(key, '');
        } else if (value && !(value instanceof File)) {
          if (value instanceof Date) {
            formData.set(key, new Date(value).toISOString());
          } else if (value === Object(value)) {
            formData.set(key, JSON.stringify(value));
          } else {
            formData.set(key, value.toString());
          }
        }
      });

      dispatch(
        updateUser(user.id, formData, {
          onSuccess: () => {
            onProcess?.();
            setState({ ...state, isLoading: false });
          },
          onError: () => setState({ ...state, isLoading: false }),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[768px]'>
      {!state.isLoading ? (
        <>
          <form ref={formRef} className='flex flex-col px-10 py-8 gap-5' onSubmit={onSubmit}>
            {state.error && (
              <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-3 font-mono text-sm'>
                {state.error}
              </span>
            )}
            <div className='flex items-center gap-4'>
              {((!user.avatar && !state.data.avatar) || state.data.avatar === null) && (
                <div className='flex items-center justify-center bg-gray-300 w-[80px] rounded-full aspect-square'>
                  <UserIcon className='size-8' />
                </div>
              )}
              {user.avatar && state.data.avatar === undefined && (
                <img
                  src={resolveImage(user.avatar)}
                  alt='User profile image'
                  className='rounded-full w-[80px] aspect-square object-cover'
                />
              )}
              {state.data.avatar && (
                <img
                  src={URL.createObjectURL(state.data.avatar)}
                  alt='User profile image'
                  className='rounded-full w-[80px] aspect-square object-cover'
                />
              )}
              <div className='flex flex-col gap-2'>
                <label
                  onClick={() => setState({ ...state, data: { ...state.data, avatar: null } })}
                  className='cursor-pointer inline-flex text-center justify-center items-center bg-neutral-200 rounded-full px-8 py-1 transition-all duration-300 hover:bg-neutral-300 font-medium'
                >
                  Delete
                </label>
                <label
                  htmlFor='update_user_avatar'
                  className='cursor-pointer inline-flex text-center justify-center items-center bg-neutral-200 rounded-full px-8 py-1 transition-all duration-300 hover:bg-neutral-300 font-medium'
                >
                  Upload
                </label>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  name='user-avatar'
                  id='update_user_avatar'
                  onChange={event =>
                    setState({ ...state, data: { ...state.data, avatar: event.target.files?.[0] } })
                  }
                />
              </div>
            </div>
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
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
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
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
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
            <div className='flex flex-col'>
              <label
                htmlFor='update_user_password'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Password
              </label>
              <input
                type='password'
                id='update_user_password'
                placeholder='Password'
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, password: event.target.value },
                    error: null,
                  })
                }
              />
            </div>
            <div className='flex flex-col'>
              <label
                htmlFor='update_user_first_name'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                First name
              </label>
              <input
                type='text'
                id='update_user_first_name'
                placeholder='John'
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                defaultValue={state.data.firstName}
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, firstName: event.target.value },
                    error: null,
                  })
                }
              />
            </div>
            <div className='flex flex-col'>
              <label
                htmlFor='update_user_last_name'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Last name
              </label>
              <input
                id='update_user_last_name'
                type='text'
                placeholder='Doe'
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                defaultValue={state.data.lastName}
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, lastName: event.target.value },
                    error: null,
                  })
                }
              />
            </div>
            <div className='flex flex-col'>
              <label
                htmlFor='update_user_bio'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Bio
              </label>
              <textarea
                id='update_user_bio'
                className='border border-stone-400 p-3 rounded-lg whitespace-pre-wrap text-stone-800 placeholder:text-stone-400 min-h-[170px] font-sans'
                defaultValue={state.data.bio || undefined}
                placeholder='My biography ...'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, bio: event.target.value },
                    error: null,
                  })
                }
              />
            </div>
            <div className='mt-5 flex gap-4'>
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
        </>
      ) : (
        <div className='px-10 py-8 flex flex-col items-center justify-center min-h-[300px] gap-5'>
          <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
          <p className='text-center font-mono'>
            We are proceeding your request. Please, wait for some time
          </p>
        </div>
      )}
    </Modal>
  );
};

export default EditUserModal;

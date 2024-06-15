import { useWallet } from '@solana/wallet-adapter-react';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import { useAuth } from '../../hooks/auth.hooks';
import { GoogleIcon } from '../../components/atoms/Icons/Icons';
import cookies from 'js-cookie';
import * as jose from 'jose';
import axios from 'axios';

interface CreateAccountFormState {
  data: {
    walletId: string;
    email: string;
    username: string;
    role: UserRoleEnum;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
  error: string | null;
  withGoogle: boolean;
}

const initialState: CreateAccountFormState = {
  data: {
    walletId: '',
    email: '',
    username: '',
    role: UserRoleEnum.Startup,
    password: undefined,
    firstName: undefined,
    lastName: undefined,
  },
  error: null,
  withGoogle: false,
};

const SignUpPage: FC = () => {
  const [state, setState] = useState(initialState);
  const wallet = useWallet();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignUpWithGoogle = useCallback(async () => {
    const response = await axios.post('/oauth/google', {
      referer: window.location.toString(),
    });

    window.location.href = response.data.url;
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!state.data.walletId) {
      setState({ ...state, error: 'The wallet was not chosen' });
      return;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(state.data.email)) {
      setState({ ...state, error: 'Email must have the following format: example@gmail.com' });
      return;
    }

    if (!/^(\d|\w)+$/.test(state.data.username)) {
      setState({
        ...state,
        error: 'Username cannot be empty and must contain only latin letters, digits or underscore',
      });
      return;
    }

    if (
      state.data.password &&
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\.])[A-Za-z\d@$!%*#?&_=\-+\.]{8,}$/.test(
        state.data.password,
      )
    ) {
      setState({
        ...state,
        error:
          'The password must be minimum 8 characters long and contain at least one latin letter, one digit and one special symbol',
      });
      return;
    }

    if (!state.error) {
      signUp(
        wallet,
        { ...state.data, role: [state.data.role] },
        {
          onSuccess: () => navigate(AppRoutes.Home),
          onError: ({ response }) => setState({ ...state, error: response.data.error }),
        },
      );
    }
  };

  useEffect(() => {
    if (wallet.publicKey) {
      setState({ ...state, data: { ...state.data, walletId: wallet.publicKey.toBase58() } });
    } else {
      setState({ ...state, data: { ...state.data, walletId: '' } });
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (cookies.get('auth.token')) {
      jose
        .jwtVerify(
          cookies.get('auth.token') || '',
          new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET),
        )
        .then(result => {
          const payload = result.payload as any;

          if (payload.error) {
            setState({ ...state, error: payload.error });
          } else {
            const { email, firstName, lastName } = payload;
            setState({
              ...state,
              data: { ...state.data, email, firstName, lastName },
              withGoogle: true,
            });
          }
        });
      cookies.remove('auth.token');
    }
  }, []);

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex flex-col items-center justify-center flex-1 py-10'>
        <img src='/logo.png' className='w-[10em] mb-12' />
        <form
          className='flex flex-col max-w-3xl w-full bg-white border p-10 rounded-xl'
          onSubmit={onSubmit}
        >
          <h3 className='w-full font-bold text-2xl text-zinc-900 mb-1'>Create account</h3>
          <p className='text mb-4 text-neutral-500 font-medium'>
            Fill in all the fields to complete the new account registration process
          </p>
          {state.error && (
            <span className='bg-rose-100 border border-rose-200 rounded-md p-2 font-mono text-sm'>
              {state.error}
            </span>
          )}
          <div className='flex flex-col gap-4 my-4'>
            <div className='flex flex-col'>
              <label
                htmlFor='create_account_walletId'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Wallet ID:
              </label>
              <div className='grid sm:grid-cols-[1fr_200px] gap-4 items-center'>
                <input
                  type='text'
                  id='create_account_walletId'
                  defaultValue={state.data.walletId}
                  readOnly
                  disabled
                  className='border disabled:bg-neutral-100 border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                />
                <WalletMultiButton>Choose a wallet</WalletMultiButton>
              </div>
            </div>
            <div className='flex flex-col'>
              <label
                htmlFor='create_account_email'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Email:
              </label>
              <input
                disabled={state.withGoogle}
                className='disabled:bg-neutral-100 border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                type='email'
                id='create_account_email'
                placeholder='example@gmail.com'
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
                htmlFor='create_account_username'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Username:
              </label>
              <input
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                type='text'
                id='create_account_username'
                defaultValue={state.data.username}
                placeholder='venturelaunch'
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
                htmlFor='create_account_role'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Role:
              </label>
              <select
                id='create_account_role'
                value={state.data.role}
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, role: event.target.value as UserRoleEnum },
                    error: null,
                  })
                }
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
              >
                {Object.values(UserRoleEnum).map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex flex-col'>
            <label
              htmlFor='create_account_password'
              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
            >
              Password (Optional):
            </label>
            <span className='text-sm font-sans mb-3 inline-flex font-medium text-stone-400 mx-0.5 text-justify'>
              If you want to have an opportunity to sign in with email and password you have to fill
              in this field. You will also be able to set or change it on your profile page later.
              The password should be at least 8 characters long and contain at least one latin
              letter, one digit and one special symbol.
            </span>
            <input
              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
              type='password'
              id='create_account_password'
              defaultValue={state.data.password}
              placeholder='Password'
              onChange={event =>
                setState({
                  ...state,
                  data: { ...state.data, password: event.target.value },
                  error: null,
                })
              }
            />
          </div>
          <button
            type='submit'
            className='text-lg mt-8 inline-flex text-center justify-center items-center border-2 border-transparent hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900 bg-zinc-900 text-white transition-all duration-300 rounded-full px-10 py-3 font-medium'
          >
            Create account
          </button>
          <div className='flex items-center justify-center my-8 h-[2px] bg-zinc-400 rounded-lg mx-0.5'>
            <span className='bg-white px-2 rounded-full text-sm text-zinc-600 font-medium text-center'>
              OR
            </span>
          </div>
          <button
            type='button'
            className='text-lg inline-flex text-center justify-center items-center border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-300 rounded-full px-10 py-3 font-medium'
            onClick={handleSignUpWithGoogle}
          >
            <GoogleIcon className='size-5 me-3' />
            Sign up with Google
          </button>
          <span className='block mt-8 text-center'>
            Already have a registered account?{' '}
            <Link
              to={AppRoutes.SignIn}
              state={{ walletDisconnect: true }}
              className='text-blue-500'
            >
              Sign in
            </Link>
          </span>
        </form>
        <img src='/solana-foundation-logo.png' className='w-40 mt-10' />
      </div>
    </div>
  );
};

export default SignUpPage;

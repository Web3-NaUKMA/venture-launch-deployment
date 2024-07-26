import { useWallet } from '@solana/wallet-adapter-react';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useLocation, useNavigate } from 'react-router';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { GoogleIcon } from '../../components/atoms/Icons/Icons';
import axios from 'axios';
import cookies from 'js-cookie';
import { SignInMethod } from '../../types/auth.types';
import * as jose from 'jose';

export interface SignInFormState {
  data: {
    email: string;
    password: string;
  };
  error?: string;
  isLoaded: boolean;
  isLoggedIn: boolean;
}

const initialState: SignInFormState = {
  data: {
    email: '',
    password: '',
  },
  isLoaded: false,
  isLoggedIn: false,
};

const SignInPage: FC = () => {
  const [state, setState] = useState(initialState);
  const { signIn } = useAuth();
  const wallet = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignInWithGoogle = useCallback(async () => {
    const response = await axios.post('/oauth/google', {
      referer: window.location.toString(),
    });

    window.location.href = response.data.url;
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(state.data.email)) {
      setState({ ...state, error: 'Email must have the following format: example@gmail.com' });
      return;
    }

    if (
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

    signIn(
      SignInMethod.Credentials,
      { email: state.data.email, password: state.data.password },
      {
        onSuccess: () => navigate(AppRoutes.Home),
        onError: ({ response }) => setState({ ...state, error: response.data.error }),
      },
    );
  };

  useEffect(() => {
    if (!state.isLoaded) {
      setState({ ...state, isLoaded: true });
    }
  }, [state.isLoaded]);

  useEffect(() => {
    if (cookies.get('auth.token')) {
      jose
        .jwtVerify(
          cookies.get('auth.token') || '',
          new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET),
        )
        .then(result => {
          const payload = result.payload as any;

          if (payload.accessToken) {
            signIn(
              SignInMethod.Google,
              { googleAccessToken: payload.accessToken },
              {
                onSuccess: () => navigate(AppRoutes.Home),
                onError: ({ response }) => setState({ ...state, error: response.data.error }),
              },
            );
          } else {
            setState({ ...state, error: payload.error });
          }
        });
      cookies.remove('auth.token');
    }
  }, []);

  useEffect(() => {
    if (state.isLoaded) {
      if (wallet.publicKey && location.state?.walletDisconnect) {
        wallet.publicKey = null;
        wallet.disconnect();
        sessionStorage.removeItem('wallet');
        location.state.walletDisconnect = false;
        return;
      }

      if (wallet.publicKey && wallet.signMessage && !state.isLoggedIn) {
        setState({ ...state, isLoggedIn: true });
        signIn(
          SignInMethod.Wallet,
          { wallet },
          {
            onSuccess: () => {
              navigate(AppRoutes.Home);
              sessionStorage.setItem('wallet', wallet.publicKey!.toString());
              setState({ ...state, isLoggedIn: false });
            },
            onError: () => {
              setState({
                ...state,
                error: 'The user with such Wallet ID does not exist!',
                isLoggedIn: false,
              });
              wallet.disconnect();
            },
          },
        );
      }
    }
  }, [wallet.publicKey, wallet.signMessage, state.isLoaded, state.isLoggedIn]);

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex flex-col items-center justify-center flex-1 py-10'>
        <div className='flex-1 flex flex-col items-center justify-center w-full'>
          <img src='/logo.png' className='w-[10em] mb-12' />
          <form
            className='max-w-xl flex flex-col w-full bg-white border p-10 rounded-xl'
            onSubmit={handleSubmit}
          >
            <h3 className='w-full font-bold text-2xl text-zinc-900 mb-1'>
              Sign in to your account
            </h3>
            <p className='text mb-4 text-neutral-500 font-medium'>
              Enter with email and password or continue with Google or Wallet
            </p>
            {state.error && (
              <span className='p-2 mb-2 bg-rose-100 border border-rose-200 rounded-md font-mono text-sm inline-flex'>
                {state.error}
              </span>
            )}
            <div className='flex flex-col gap-4 my-4'>
              <input
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                type='email'
                id='sign_in_email'
                defaultValue={state.data.email}
                placeholder='Email'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, email: event.target.value },
                    error: undefined,
                  })
                }
              />
              <input
                className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
                type='password'
                id='sign_in_password'
                defaultValue={state.data.password}
                placeholder='Password'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, password: event.target.value },
                    error: undefined,
                  })
                }
              />
            </div>
            <button
              type='submit'
              className='mt-4 text-lg inline-flex text-center justify-center items-center border-2 border-transparent hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900 bg-zinc-900 text-white transition-all duration-300 rounded-full px-10 py-3 font-medium'
            >
              Sign in
            </button>
            <div className='flex items-center justify-center my-10 h-[2px] bg-zinc-400 rounded-lg mx-0.5'>
              <span className='bg-white px-2 rounded-full text-sm text-zinc-600 font-medium text-center'>
                OR
              </span>
            </div>
            <div className='flex flex-col gap-3'>
              <WalletMultiButton style={{ fontSize: '1.125rem', lineHeight: '1.75rem' }}>
                Continue with Solana Wallet
              </WalletMultiButton>
              <button
                type='button'
                className='text-lg inline-flex text-center justify-center items-center border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-300 rounded-full px-10 py-3 font-medium'
                onClick={handleSignInWithGoogle}
              >
                <GoogleIcon className='size-5 me-2' />
                Continue with Google
              </button>
            </div>
            <span className='block mt-8 text-center'>
              Do not have a registered account yet?{' '}
              <Link to={AppRoutes.SignUp} className='text-blue-500'>
                Sign up
              </Link>
            </span>
          </form>
        </div>
      </div>
      <div className='md:left-20 bottom-20 absolute w-full md:w-auto inline-flex justify-center'>
        <img src='/solana-foundation-logo.png' className='w-72' />
      </div>
    </div>
  );
};

export default SignInPage;

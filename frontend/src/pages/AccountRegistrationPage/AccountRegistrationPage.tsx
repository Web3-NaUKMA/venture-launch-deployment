import { useWallet } from '@solana/wallet-adapter-react';
import { FC, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hooks';
import { useAppSelector } from '../../hooks/redux.hooks';
import { selectErrors } from '../../redux/slices/auth.slice';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import Button from '../../components/atoms/Button/Button';
import { v4 as uuid } from 'uuid';

interface IAccountRegistrationPageState {
  data: {
    walletId: string;
    email: string;
    username: string;
    role: UserRoleEnum;
  };
  error: string | null;
}

const initialState: IAccountRegistrationPageState = {
  data: {
    walletId: '',
    email: '',
    username: '',
    role: UserRoleEnum.Startup,
  },
  error: null,
};

const AccountRegistrationPage: FC = () => {
  const { signUp, signOut } = useAuth();
  const wallet = useWallet();
  const errors = useAppSelector(selectErrors);
  const [state, setState] = useState({
    ...initialState,
    data: { ...initialState.data, walletId: wallet.publicKey?.toBase58() ?? '' },
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet.publicKey && wallet.signMessage) {
      setState({ ...state, data: { ...state.data, walletId: wallet.publicKey.toBase58() } });
    } else {
      signOut();
      navigate(AppRoutes.SignUp);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    setState({ ...state, error: errors.register });
  }, [errors.register]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!state.data.email?.trim()) {
      setState(prevState => ({ ...prevState, error: 'User email cannot be empty!' }));
    }

    if (!state.data.username?.trim()) {
      setState(prevState => ({ ...prevState, error: 'Username cannot be empty!' }));
    }

    if (!state.error) {
      signUp(
        wallet,
        { ...state.data, role: [state.data.role] },
        {
          onSuccess: () => navigate(AppRoutes.Projects),
        },
      );
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <img src='/logo.png' className='w-80 mb-12' />
      <form
        className='flex flex-col max-w-[768px] w-full bg-white p-5 rounded-xl shadow-[0_0_30px_-15px_silver]'
        onSubmit={onSubmit}
      >
        <h3 className='w-full mb-1 font-bold text-2xl text-neutral-500'>Create account</h3>
        <p className='text mb-8'>
          Fill in all the fields to complete the new account registration process
        </p>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 rounded-md p-2 mb-8'>
            {state.error}
          </span>
        )}
        <label htmlFor='create_account_walletId' className='mb-1'>
          Wallet ID:
        </label>
        <input
          type='text'
          id='create_account_walletId'
          defaultValue={state.data.walletId}
          readOnly
          disabled
          className='border mb-4 p-2 rounded-md'
        />
        <label htmlFor='create_account_username' className='mb-1'>
          Username:
        </label>
        <input
          className='border mb-4 p-2 rounded-md'
          type='text'
          id='create_account_username'
          defaultValue={state.data.username}
          placeholder='web3naukma'
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, username: event.target.value },
              error: null,
            })
          }
        />
        <label htmlFor='create_account_email' className='mb-1'>
          Email:
        </label>
        <input
          className='border mb-4 p-2 rounded-md'
          type='email'
          id='create_account_email'
          placeholder='example@gmail.com'
          defaultValue={state.data.email}
          onChange={event =>
            setState({ ...state, data: { ...state.data, email: event.target.value }, error: null })
          }
        />
        <label htmlFor='create_account_role' className='mb-1'>
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
          className='border mb-4 p-2 rounded-md'
        >
          {Object.values(UserRoleEnum).map(item => (
            <option key={uuid()} value={item}>
              {item}
            </option>
          ))}
        </select>
        <Button
          type='submit'
          className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full font-medium text-center justify-center'
        >
          Create account
        </Button>
      </form>
      <span className='block mt-5'>
        Already have a registered account?{' '}
        <Link to={AppRoutes.SignIn} state={{ walletDisconnect: true }} className='text-blue-500'>
          Sign in
        </Link>
      </span>
      <img src='/solana-foundation-logo.png' className='w-40 mt-10' />
    </div>
  );
};

export default AccountRegistrationPage;

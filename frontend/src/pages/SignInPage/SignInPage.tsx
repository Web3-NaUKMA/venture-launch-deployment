import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useLocation, useNavigate } from 'react-router';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';

const SignInPage: FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const wallet = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (wallet.publicKey && location.state?.walletDisconnect) {
      wallet.publicKey = null;
      wallet.disconnect();
      location.state.walletDisconnect = false;
      return;
    }

    if (wallet.publicKey && wallet.signMessage) {
      signIn(wallet, {
        onSuccess: () => {
          navigate(AppRoutes.Projects);
          sessionStorage.setItem('wallet', wallet.publicKey!.toString());
        },
        onError: () => {
          setError('The user with such Wallet ID does not exist!');
          wallet.disconnect();
        },
      });
    }
  }, [wallet.publicKey]);

  return (
    <div className='flex flex-col items-center justify-center h-screen flex-1 py-20'>
      <div className='flex-1 flex flex-col items-center justify-center'>
        <img src='/logo.png' className='w-[30em] mb-12' />
        {error && (
          <span className='flex mb-5 p-2 bg-rose-100 border border-rose-200 rounded-md'>
            {error}
          </span>
        )}
        <WalletMultiButton>Sign in with Solana Wallet</WalletMultiButton>
        <span className='block mt-10'>
          Do not have a registered account yet?{' '}
          <Link to={AppRoutes.SignUp} className='text-blue-500'>
            Sign up
          </Link>
        </span>
      </div>
      <img src='/solana-logo.png' className='w-40' />
    </div>
  );
};

export default SignInPage;

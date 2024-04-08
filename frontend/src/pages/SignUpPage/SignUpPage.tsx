import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';

const SignUpPage: FC = () => {
  const [pageIsLoaded, setPageIsLoaded] = useState(false);
  const wallet = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet) wallet.disconnect();
    setPageIsLoaded(true);
  }, []);

  useEffect(() => {
    if (wallet.publicKey && wallet.signMessage && pageIsLoaded) {
      navigate(AppRoutes.AccountRegistration);
    }
  }, [wallet.publicKey]);

  return (
    <div className='flex flex-col items-center justify-center h-screen flex-1 py-20'>
      <div className='flex-1 flex flex-col items-center justify-center'>
        <img src='/logo.png' className='w-[30em] mb-12' />
        <WalletMultiButton>Sign up with Solana Wallet</WalletMultiButton>
        <span className='block mt-10'>
          Already have a registered account?{' '}
          <Link to={AppRoutes.SignIn} className='text-blue-500'>
            Sign in
          </Link>
        </span>
      </div>
      <img src='/solana-logo.png' className='w-40' />
    </div>
  );
};

export default SignUpPage;

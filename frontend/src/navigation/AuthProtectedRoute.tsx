import { FC, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/auth.hooks';
import { AppRoutes } from '../types/enums/app-routes.enum';
import { UserRoleEnum } from '../types/enums/user-role.enum';
import { useWallet } from '@solana/wallet-adapter-react';

export interface IAuthProtectedRouteProps {
  roles?: UserRoleEnum[];
}

const AuthProtectedRoute: FC<IAuthProtectedRouteProps> = ({
  roles = Object.values(UserRoleEnum),
}) => {
  const [loaded, setLoaded] = useState(false);
  const { fetchLatestAuthInfo, signOut } = useAuth();
  const navigate = useNavigate();
  const wallet = useWallet();

  useEffect(() => {
    if (!wallet.connected && !wallet.connecting) {
      if (!loaded) setLoaded(true);
      else {
        signOut();
        navigate(AppRoutes.SignIn);
      }
    }
  }, [wallet]);

  useEffect(() => {
    fetchLatestAuthInfo({
      onSuccess: user => {
        if (!user || !roles?.find(role => user.role.includes(role))) navigate(AppRoutes.SignIn);
      },
      onError: () => navigate(AppRoutes.SignIn),
    });
  }, []);

  return <Outlet />;
};

export default AuthProtectedRoute;

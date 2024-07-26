import { FC, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/auth.hooks';
import { AppRoutes } from '../types/enums/app-routes.enum';
import { UserRoleEnum } from '../types/enums/user-role.enum';

export interface AuthProtectedRouteProps {
  roles?: UserRoleEnum[];
}

const AuthProtectedRoute: FC<AuthProtectedRouteProps> = ({
  roles = Object.values(UserRoleEnum),
}) => {
  const { fetchLatestAuthInfo, signOut } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    fetchLatestAuthInfo({
      onSuccess: async user => {
        if (!user || !roles?.find(role => user.role.includes(role))) {
          await signOut();
          location.replace(AppRoutes.SignIn);
        }
      },
      onError: async () => {
        await signOut();
        location.replace(AppRoutes.SignIn);
      },
    });
  }, [pathname]);

  return <Outlet />;
};

export default AuthProtectedRoute;

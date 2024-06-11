import { FC, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/auth.hooks';
import { AppRoutes } from '../types/enums/app-routes.enum';
import { UserRoleEnum } from '../types/enums/user-role.enum';

export interface IAuthProtectedRouteProps {
  roles?: UserRoleEnum[];
}

const AuthProtectedRoute: FC<IAuthProtectedRouteProps> = ({
  roles = Object.values(UserRoleEnum),
}) => {
  const { fetchLatestAuthInfo, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestAuthInfo({
      onSuccess: user => {
        if (!user || !roles?.find(role => user.role.includes(role))) {
          signOut();
          navigate(AppRoutes.SignIn);
        }
      },
      onError: () => {
        signOut();
        navigate(AppRoutes.SignIn);
      },
    });
  }, []);

  return <Outlet />;
};

export default AuthProtectedRoute;

import { Outlet } from 'react-router';
import Navbar from '../molecules/Navbar/Navbar';
import { AppRoutes } from '../../types/enums/app-routes.enum';

export interface NavbarLink {
  name: string;
  to: string;
}

const links: NavbarLink[] = [
  {
    name: 'Home',
    to: AppRoutes.Home,
  },
  {
    name: 'Portfolio',
    to: AppRoutes.Portfolio,
  },

  {
    name: 'Message Center',
    to: AppRoutes.MessageCenter,
  },
  {
    name: 'Dashboard',
    to: AppRoutes.Dashboard,
  },
  {
    name: 'About',
    to: AppRoutes.About,
  },
];

const PageWithNavigationTemplate = () => {
  return (
    <div className='flex justify-center relative w-full'>
      <div className='flex flex-col relative min-h-screen w-full max-w-[1440px]'>
        <Navbar links={links} />
        <Outlet />
      </div>
    </div>
  );
};

export default PageWithNavigationTemplate;

import { NavLink, useNavigate } from 'react-router-dom';
import { FC, useState } from 'react';
import { INavbarLink } from '../../templates/PageWithNavigationTemplate';
import { v4 as uuid } from 'uuid';
import { AppRoutes } from '../../../types/enums/app-routes.enum';
import {
  BurgerMenuIcon,
  CubeIcon,
  ExitIcon,
  IdentificationIcon,
  UserCircleIcon,
} from '../../atoms/Icons/Icons';
import { useAuth } from '../../../hooks/auth.hooks';
import { useOutsideClick } from '../../../hooks/dom.hooks';
import Button from '../../atoms/Button/Button';

export interface INavbarProps {
  links: INavbarLink[];
}

const DesktopNavbar: FC<INavbarProps> = ({ links }) => {
  const { authenticatedUser, signOut } = useAuth();
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const profileButtonRef = useOutsideClick(() => setIsProfileDropdownVisible(false));
  const navigate = useNavigate();

  return (
    <>
      <div className='hidden md:flex items-center px-3'>
        <NavLink
          to={AppRoutes.Root}
          className='inline-flex items-center justify-center font-bold me-10 hover:text-indigo-700 transition-[0.3s_ease]'
        >
          <img src='/logo.png' className='w-40' />
        </NavLink>
        {links.map(link => (
          <NavLink
            key={uuid()}
            to={link.to}
            className={({ isActive, isPending }) =>
              isActive
                ? 'py-1.5 text-xl font-serif font-bold mx-4 transition-[0.3s_ease]'
                : isPending
                ? 'py-1.5 text-xl font-serif font-medium mx-4 transition-[0.3s_ease]'
                : 'py-1.5 text-xl font-serif font-medium rounded-md mx-4 transition-[0.3s_ease]'
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
      <div className='hidden md:block'>
        {authenticatedUser && (
          <>
            <div
              ref={profileButtonRef}
              onClick={() => setIsProfileDropdownVisible(true)}
              className='relative px-3 cursor-pointer transition-[0.3s_ease]'
            >
              <div className='flex items-center justify-center bg-gray-500 font-serif ps-5 text-white rounded-full'>
                <span className='font-medium'>{authenticatedUser.username}</span>
                <div className='ms-2 rounded-full bg-gray-400 p-1.5'>
                  <UserCircleIcon className='size-6' />
                </div>
              </div>

              {isProfileDropdownVisible && (
                <div className='flex flex-col absolute bg-white shadow-[0_0_7px_-4px_black] top-[calc(100%_+_0.5em)] right-3 -left-1/4 p-2 rounded-md font-serif'>
                  <NavLink
                    to={AppRoutes.Profile}
                    className='inline-flex items-center px-2 py-1.5 rounded-md font-semibold text-gray-600 text-sm hover:bg-neutral-100 transition-[0.3s_ease]'
                    onClick={event => {
                      event.stopPropagation();
                      setIsProfileDropdownVisible(false);
                    }}
                  >
                    <UserCircleIcon className='size-4 me-2' />
                    User Account
                  </NavLink>
                  <hr className='my-2' />
                  <span
                    onClick={() => {
                      signOut();
                      navigate(AppRoutes.SignIn, { state: { walletDisconnect: true } });
                    }}
                    className='inline-flex items-center px-2 py-1.5 rounded-md font-semibold text-gray-600 text-sm hover:bg-neutral-100 transition-[0.3s_ease]'
                  >
                    <ExitIcon className='size-4 me-2' />
                    Sign Out
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const MobileNavbar: FC<INavbarProps> = ({ links }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { authenticatedUser, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className='flex md:hidden items-center px-3 relative font-serif'>
        <NavLink
          to={AppRoutes.Root}
          className='inline-flex items-center justify-center font-bold me-10'
        >
          <img src='/logo.png' className='w-40' />
        </NavLink>
        {isMenuVisible && (
          <div className='absolute top-[calc(100%_+_0.75em_+_6px)] h-[calc(100vh_-_100%_-_1.5em_-_6px)] bg-white flex flex-col -left-3 w-screen p-4 justify-between'>
            <div className='flex flex-col'>
              {links.map(link => (
                <NavLink
                  key={uuid()}
                  to={link.to}
                  className={({ isActive, isPending }) =>
                    isActive
                      ? 'rounded-md text-lg text-white bg-black font-bold transition-[0.3s_ease] mb-2 p-3'
                      : isPending
                      ? 'rounded-md text-lg font-medium transition-[0.3s_ease] hover:text-indigo-500 mb-2 p-3 border'
                      : 'rounded-md text-lg font-medium transition-[0.3s_ease] hover:text-indigo-500 mb-2 p-3 border'
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
            {authenticatedUser && (
              <div>
                <h3 className='font-bold mb-3 text-center'>
                  Selected account: {authenticatedUser.username}
                </h3>
                <div className='flex flex-col'>
                  <NavLink
                    to={AppRoutes.Profile}
                    className={({ isActive, isPending }) =>
                      isActive
                        ? 'inline-flex items-center rounded-md text-white bg-indigo-600 font-bold transition-[0.3s_ease] mb-2 p-3'
                        : isPending
                        ? 'inline-flex items-center rounded-md font-medium transition-[0.3s_ease] hover:text-indigo-500 mb-2 p-3 border'
                        : 'inline-flex items-center rounded-md font-medium transition-[0.3s_ease] hover:text-indigo-500 mb-2 p-3 border'
                    }
                  >
                    <UserCircleIcon className='size-5 me-2 w-[32px]' />
                    User account
                  </NavLink>
                  <span
                    onClick={() => {
                      signOut();
                      navigate(AppRoutes.SignIn, { state: { walletDisconnect: true } });
                    }}
                    className='inline-flex items-center rounded-md font-medium transition-[0.3s_ease] hover:text-indigo-500 mb-2 p-3 border'
                  >
                    <ExitIcon className='size-5 me-2 w-[32px]' />
                    Sign Out
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className='md:hidden'>
        <Button className='border rounded-md p-1' onClick={() => setIsMenuVisible(!isMenuVisible)}>
          <BurgerMenuIcon className='size-8' />
        </Button>
      </div>
    </>
  );
};

export const Navbar: FC<INavbarProps> = ({ links }) => {
  return (
    <nav className='flex p-3 items-center py-10 justify-between z-50'>
      <DesktopNavbar links={links} />
      <MobileNavbar links={links} />
    </nav>
  );
};

export default Navbar;

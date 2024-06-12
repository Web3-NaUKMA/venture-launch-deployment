import { FC, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import Button from '../../components/atoms/Button/Button';
import { createPortal } from 'react-dom';
import EditUserModal from '../../components/organisms/EditUserModal/EditUserModal';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchAllProjectLaunches,
  selectProjectLaunches,
} from '../../redux/slices/project-launch.slice';
import { UserIcon } from '../../components/atoms/Icons/Icons';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { useNavigate } from 'react-router';
import { Project } from '../../components/molecules/Project/Project';
import { resolveImage } from '../../utils/file.utils';

const ProfilePage: FC = () => {
  const { authenticatedUser, fetchLatestAuthInfo, signOut } = useAuth();
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const projects = useAppSelector(selectProjectLaunches);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticatedUser) {
      dispatch(fetchAllProjectLaunches({ ownerId: authenticatedUser.id }));
    }
  }, [authenticatedUser]);

  return (
    authenticatedUser && (
      <>
        {isEditProfileModalVisible &&
          createPortal(
            <EditUserModal
              title='Edit profile'
              onClose={() => setIsEditProfileModalVisible(false)}
              onProcess={() => {
                setIsEditProfileModalVisible(false);
                fetchLatestAuthInfo();
              }}
              className='max-w-[596px]'
              user={authenticatedUser}
            />,
            document.getElementById('root')!,
          )}
        <div className='flex mt-3 px-6 flex-col justify-start align-center'>
          <h3 className='px-2 text-3xl font-serif mb-10'>User profile</h3>
          <div className='flex flex-col max-w-[1440px] w-full bg-white shadow-[0_0_15px_-7px_gray] rounded-xl'>
            <div className='flex items-center justify-between px-10 py-5'>
              <div className='flex items-center gap-4'>
                {authenticatedUser.avatar ? (
                  <img
                    src={resolveImage(authenticatedUser.avatar)}
                    alt='User profile image'
                    className='w-[64px] rounded-full aspect-square object-cover'
                  />
                ) : (
                  <div className='flex items-center justify-center bg-gray-300 w-[64px] rounded-full aspect-square'>
                    <UserIcon className='size-8' />
                  </div>
                )}
                <span className='font-sans font-semibold text-2xl'>
                  {authenticatedUser.username}
                </span>
              </div>
              <div className='flex gap-4'>
                <Button
                  className='inline-flex text-lg font-sans font-medium border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1 transition-[0.3s_ease] rounded-full'
                  onClick={() => setIsEditProfileModalVisible(true)}
                >
                  Edit
                </Button>
                <Button
                  className='inline-flex text-lg font-sans font-medium border-transparent bg-neutral-400 hover:bg-transparent border-2 hover:border-neutral-400 hover:text-neutral-400 text-white px-10 py-1 transition-[0.3s_ease] rounded-full'
                  onClick={() => {
                    signOut();
                    navigate(AppRoutes.SignIn, { state: { walletDisconnect: true } });
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>User ID</h3>
              <span className='font-mono'>{authenticatedUser.id}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Wallet ID</h3>
              <span className='font-mono'>{authenticatedUser.walletId}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Email</h3>
              <span className='font-mono'>{authenticatedUser.email}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>First name</h3>
              {authenticatedUser.firstName?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{authenticatedUser.firstName}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Last name</h3>
              {authenticatedUser.lastName?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{authenticatedUser.lastName}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Role</h3>
              <span className='font-mono'>{authenticatedUser.role.join(', ')}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Bio</h3>
              {authenticatedUser.bio?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{authenticatedUser.bio}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
          </div>
        </div>
        <div className='my-10 px-6'>
          <h4 className='px-2 text-3xl font-serif mb-10'>My projects</h4>
          {projects.length > 0 ? (
            <div className='grid lg:grid-cols-2 gap-10 mt-5 auto-rows-fr'>
              {projects.map(project => (
                <Project key={project.id} project={project} variant='short' />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center px-10 py-8 rounded-2xl border-[3px] border-dashed border-stone-300'>
              <p className='font-mono m-0 text-lg text-stone-400'>
                You have not launched any projects yet
              </p>
            </div>
          )}
        </div>
      </>
    )
  );
};

export default ProfilePage;

import { FC, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import Button from '../../components/atoms/Button/Button';
import { createPortal } from 'react-dom';
import EditUserModal from '../../components/organisms/EditUserModal/EditUserModal';
import { ProjectGrid } from '../../components/organisms/ProjectGrid/ProjectGrid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchAllProjectLaunches,
  selectProjectLaunches,
} from '../../redux/slices/project-launch.slice';

const ProfilePage: FC = () => {
  const { authenticatedUser, fetchLatestAuthInfo } = useAuth();
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const projects = useAppSelector(selectProjectLaunches);
  const dispatch = useAppDispatch();

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
              buttons={[
                {
                  type: 'accept',
                  name: 'Save changes',
                  action: () => {
                    setIsEditProfileModalVisible(false);
                    fetchLatestAuthInfo();
                  },
                },
                { type: 'close', name: 'Close', action: () => setIsEditProfileModalVisible(false) },
              ]}
              className='max-w-[596px]'
              user={authenticatedUser}
            />,
            document.getElementById('root')!,
          )}
        <div className='flex p-6 flex-col justify-start align-center'>
          <div className='flex flex-col max-w-[1440px] w-full bg-white shadow-[0_0_30px_-15px_silver] rounded-xl p-5'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-bold'>User profile</h3>
              <Button
                className='inline-flex text-sm font-medium border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full'
                onClick={() => setIsEditProfileModalVisible(true)}
              >
                Edit
              </Button>
            </div>
            <hr className='mt-5' />
            <div className='divide-y divide-gray-50'>
              <div className='flex justify-between items-center py-3 font-medium text-gray-600 text-sm'>
                <h3 className='w-1/2'>User ID</h3>
                <span className='w-1/2'>{authenticatedUser.id}</span>
              </div>
              <div className='flex justify-between items-center py-3 font-medium text-gray-600 text-sm'>
                <h3 className='w-1/2'>Wallet ID</h3>
                <span className='w-1/2'>{authenticatedUser.walletId}</span>
              </div>
              <div className='flex justify-between items-start py-3 font-medium text-gray-600 text-sm'>
                <h3 className=' text-gray-600'>Username</h3>
                <span className='w-1/2'>{authenticatedUser.username}</span>
              </div>
              <div className='flex justify-between items-start py-3 font-medium text-gray-600 text-sm'>
                <h3 className='w-1/2'>Email</h3>
                <span className='w-1/2'>{authenticatedUser.email}</span>
              </div>
              <div className='flex justify-between items-start py-3 pb-0 font-medium text-gray-600 text-sm'>
                <h3 className='w-1/2'>Role</h3>
                <span className='w-1/2'>{authenticatedUser.role.join(', ')}</span>
              </div>
            </div>
          </div>
          <div className='mt-10'>
            <h4 className='text-gray-700 text-2xl font-semibold'>My projects</h4>
            <ProjectGrid projects={projects} />
          </div>
        </div>
      </>
    )
  );
};

export default ProfilePage;

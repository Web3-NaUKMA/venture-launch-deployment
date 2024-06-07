import { FC, useEffect, useState } from 'react';
import { ProjectGrid } from '../../components/organisms/ProjectGrid/ProjectGrid';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import Button from '../../components/atoms/Button/Button';
import { useAuth } from '../../hooks/auth.hooks';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import {
  fetchAllProjectLaunches,
  selectProjectLaunches,
} from '../../redux/slices/project-launch.slice';
import LaunchProjectModal from '../../components/organisms/LaunchProjectModal/LaunchProjectModal';

const ProjectsPage: FC = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjectLaunches);
  const [isLaunchProjectModalVisible, setIsLaunchProjectModalVisible] = useState(false);
  const { authenticatedUser } = useAuth();

  useEffect(() => {
    if (authenticatedUser) {
      if (authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst)) {
        dispatch(fetchAllProjectLaunches());
      } else {
        dispatch(fetchAllProjectLaunches({ isApproved: true }));
      }
    }
  }, [authenticatedUser]);

  return (
    <>
      {isLaunchProjectModalVisible &&
        createPortal(
          <LaunchProjectModal
            title='Launch new project'
            onClose={() => setIsLaunchProjectModalVisible(false)}
          />,
          document.getElementById('root')!,
        )}
      <div className='flex flex-col py-5 px-6 flex-1'>
        <div className='flex justify-between items-center mb-5'>
          <h3 className='px-2 text-3xl font-serif'>Projects</h3>
          {projects.length > 0 && authenticatedUser?.role.includes(UserRoleEnum.Startup) && (
            <Button
              onClick={() => setIsLaunchProjectModalVisible(true)}
              className='border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white font-medium px-10 text-lg py-1.5 transition-[0.3s_ease] rounded-full'
            >
              Launch project
            </Button>
          )}
        </div>
        <div className='flex flex-col flex-1'>
          {!projects.length ? (
            <div className='flex mt-5 flex-1'>
              <div className='flex flex-col border-[3px] rounded-xl flex-1 border-dashed items-center justify-center'>
                {authenticatedUser?.role.includes(UserRoleEnum.Startup) ? (
                  <>
                    <h4 className='font-medium mb-4 text-gray-400 text-lg'>
                      No projects have been launched yet
                    </h4>
                    <Button
                      onClick={() => setIsLaunchProjectModalVisible(true)}
                      className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white font-medium px-5 py-1 transition-[0.3s_ease] rounded-full'
                    >
                      Launch a new project
                    </Button>
                  </>
                ) : (
                  <h4 className='font-medium mb-4 text-gray-400 text-lg'>
                    No projects have been joined yet
                  </h4>
                )}
              </div>
            </div>
          ) : (
            <ProjectGrid projects={projects} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;

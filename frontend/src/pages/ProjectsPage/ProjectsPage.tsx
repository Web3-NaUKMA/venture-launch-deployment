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
  // const [projectsView, setProjectsView] = useState(ProjectsViewEnum.AllProjects);

  useEffect(() => {
    if (authenticatedUser) {
      // switch (projectsView) {
      //   case ProjectsViewEnum.AllProjects:
      //     if (authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst)) {
      //       dispatch(fetchAllProjectLaunches());
      //     } else {
      //       dispatch(fetchAllProjectLaunches({ isApproved: true, isFundraised: false }));
      //     }
      //     break;
      //   case ProjectsViewEnum.MyInvestments:
      //     dispatch(fetchAllProjectLaunches({ investorId: authenticatedUser.id }));
      //     break;
      //   case ProjectsViewEnum.MyProjects:
      //     dispatch(fetchAllProjectLaunches({ ownerId: authenticatedUser.id }));
      //     break;
      //   default:
      //     if (authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst)) {
      //       dispatch(fetchAllProjectLaunches());
      //     } else {
      //       dispatch(fetchAllProjectLaunches({ isApproved: true, isFundraised: false }));
      //     }
      // }

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
            buttons={[
              { type: 'close', name: 'Close', action: () => setIsLaunchProjectModalVisible(false) },
              {
                type: 'accept',
                name: 'Launch',
                action: () => setIsLaunchProjectModalVisible(false),
              },
            ]}
          />,
          document.getElementById('root')!,
        )}
      <div className='flex flex-col py-5 px-6 flex-1'>
        <div className='flex justify-between items-center'>
          <h3 className='font-medium text-2xl'>Projects</h3>
          {projects.length > 0 && authenticatedUser?.role.includes(UserRoleEnum.Startup) && (
            <Button
              onClick={() => setIsLaunchProjectModalVisible(true)}
              className='border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white font-medium px-5 py-1 transition-[0.3s_ease] rounded-full'
            >
              Launch project
            </Button>
          )}
        </div>
        <div className='flex flex-col flex-1'>
          {/* <div className='flex mt-3'>
            <div className='flex bg-zinc-900 p-1 rounded-full gap-2'>
              <span
                className={`text-white font-medium text-xs w-[110px] rounded-full py-1 text-center cursor-pointer transition-[0.3s_ease] ${
                  projectsView === ProjectsViewEnum.AllProjects
                    ? `bg-zinc-600`
                    : 'hover:bg-zinc-600'
                }`}
                onClick={() => setProjectsView(ProjectsViewEnum.AllProjects)}
              >
                All projects
              </span>
              {authenticatedUser?.role.includes(UserRoleEnum.Startup) && (
                <span
                  className={`text-white font-medium text-xs w-[110px] rounded-full py-1 text-center cursor-pointer transition-[0.3s_ease] ${
                    projectsView === ProjectsViewEnum.MyProjects
                      ? `bg-zinc-600`
                      : 'hover:bg-zinc-600'
                  }`}
                  onClick={() => setProjectsView(ProjectsViewEnum.MyProjects)}
                >
                  My projects
                </span>
              )}
              {authenticatedUser?.role.find(
                role => role === UserRoleEnum.Investor || role === UserRoleEnum.Startup,
              ) && (
                <span
                  className={`text-white font-medium text-xs w-[110px] rounded-full py-1 text-center cursor-pointer transition-[0.3s_ease] ${
                    projectsView === ProjectsViewEnum.MyInvestments
                      ? `bg-zinc-600`
                      : 'hover:bg-zinc-600'
                  }`}
                  onClick={() => setProjectsView(ProjectsViewEnum.MyInvestments)}
                >
                  My investments
                </span>
              )}
            </div>
          </div> */}
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

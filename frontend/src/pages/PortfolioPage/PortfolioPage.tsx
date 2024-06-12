import { FC, useEffect } from 'react';
import { ProjectGrid } from '../../components/organisms/ProjectGrid/ProjectGrid';
import { useAuth } from '../../hooks/auth.hooks';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchAllProjectLaunches,
  selectProjectLaunches,
} from '../../redux/slices/project-launch.slice';

export const PortfolioPage: FC = () => {
  const { authenticatedUser } = useAuth();
  const projects = useAppSelector(selectProjectLaunches);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (authenticatedUser) {
      dispatch(fetchAllProjectLaunches({ investorId: authenticatedUser.id }));
    }
  }, [authenticatedUser]);

  return (
    <div className='flex p-6 flex-col justify-start align-center flex-1'>
      <h4 className='px-2 text-3xl font-serif mb-6'>My investments</h4>
      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <div className='flex flex-col flex-1 items-center justify-center px-10 py-8 rounded-2xl border-[3px] border-dashed border-stone-300'>
          <p className='font-mono m-0 text-lg text-stone-400'>
            You have not invested into any of projects yet
          </p>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;

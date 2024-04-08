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
    <div className='flex p-6 flex-col justify-start align-center'>
      <div className='mt-10'>
        <h4 className='text-gray-700 text-2xl font-semibold'>My investments</h4>
        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
};

export default PortfolioPage;

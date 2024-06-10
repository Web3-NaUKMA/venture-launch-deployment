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
      <h4 className='px-2 text-3xl font-serif mb-6'>My investments</h4>
      <ProjectGrid projects={projects} />
    </div>
  );
};

export default PortfolioPage;

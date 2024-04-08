import { FC } from 'react';
import { Project } from '../../molecules/Project/Project';
import { IProjectLaunch } from '../../../types/project-launch.types';

export interface IProjectGridProps {
  projects: IProjectLaunch[];
}

export const ProjectGrid: FC<IProjectGridProps> = ({ projects }) => {
  return (
    <div className='grid lg:grid-cols-2 gap-20 mt-5 auto-rows-fr'>
      {projects.map(project => (
        <Project key={project.id} project={project} />
      ))}
    </div>
  );
};

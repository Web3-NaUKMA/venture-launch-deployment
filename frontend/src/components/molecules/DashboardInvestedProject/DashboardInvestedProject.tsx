import Image from 'components/atoms/Image/Image';
import { FC, HTMLAttributes } from 'react';
import { ProjectLaunch } from 'types/project-launch.types';

export interface DashboardInvestedProjectProps extends HTMLAttributes<HTMLDivElement> {
  projectLaunch: ProjectLaunch;
  allocation: number;
}

const DashboardInvestedProject: FC<DashboardInvestedProjectProps> = ({
  projectLaunch,
  allocation,
  ...props
}) => {
  return (
    <div
      className='flex bg-white rounded-xl shadow-[0_0_15px_-7px_grey] p-3 justify-between items-center'
      {...props}
    >
      <div className='flex gap-3 items-center'>
        <Image
          src={projectLaunch.logo || undefined}
          fallbackSrc='/logo.png'
          alt='Project logo'
          className='w-[32px] aspect-square object-cover'
        />
        <h3 className='font-semibold text'>{projectLaunch.name}</h3>
      </div>
      <div className='flex flex-col items-end'>
        <span className='font-mono text-lg'>${allocation}</span>
        <span className='text-stone-600 text-sm'>Allocation</span>
      </div>
    </div>
  );
};

export default DashboardInvestedProject;

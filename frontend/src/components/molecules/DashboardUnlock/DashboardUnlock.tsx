import { FC, HTMLAttributes } from 'react';
import UnlockProgressBar from '../UnlockProgressBar/UnlockProgressBar';
import { ProjectLaunch } from 'types/project-launch.types';

export interface DashboardUnlockProps extends HTMLAttributes<HTMLDivElement> {
  projectLaunch: ProjectLaunch;
}

const DashboardUnlock: FC<DashboardUnlockProps> = ({ projectLaunch, ...props }) => {
  return (
    <div
      className='flex bg-white rounded-xl shadow-[0_0_15px_-7px_grey] p-3 items-center gap-3 justify-between'
      {...props}
    >
      <div className='flex flex-col'>
        <h3 className='font-semibold text'>{projectLaunch.name}</h3>
        <div className='flex flex-col text-[9px] mt-2 gap-0.5'>
          <p>+6.25% (+4,500,000 tokens)</p>
          <p>+2.5% (+1,666,750 tokens)</p>
          <p>Unlock of 9.54M (2.2% of Total Supply)</p>
          <p>• $98.44M (2.75% of Market Cap)</p>
        </div>
      </div>
      <div className='flex gap-3 items-center'>
        <UnlockProgressBar
          className='flex flex-1 aspect-square rounded-full max-w-[100px] relative'
          percentage={Number(
            (projectLaunch.fundraiseProgress / projectLaunch.fundraiseAmount) * 100,
          )}
        />
        <h3 className='text-[11px] font-semibold max-w-[100px]'>AVAX 272.29M - $2.81B</h3>
      </div>
    </div>
  );
};

export default DashboardUnlock;

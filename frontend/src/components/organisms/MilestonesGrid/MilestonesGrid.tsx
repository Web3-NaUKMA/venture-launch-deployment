import { FC } from 'react';
import { IMilestone } from '../../../types/milestone.types';
import Button from '../../atoms/Button/Button';
import Milestone from '../../molecules/Milestone/Milestone';
import { IProject } from '../../../types/project.types';

export interface IMilestonesGrid {
  setIsCreateMilestoneModalVisible?: (...args: any[]) => any;
  isCreateMilestoneButtonVisible?: boolean;
  milestones: IMilestone[];
  project?: IProject;
}

export const MilestonesGrid: FC<IMilestonesGrid> = ({
  milestones,
  setIsCreateMilestoneModalVisible,
  isCreateMilestoneButtonVisible = true,
  project,
}) => {
  return (
    <div className='flex flex-col shadow-[0_0_30px_-15px_silver] bg-white w-full max-w-[1440px] rounded-xl mt-5 p-5'>
      <div className='flex items-center justify-between'>
        <h3 className='font-bold text-xl font-["Noto"]'>Project milestones</h3>
        {milestones.length > 0 && isCreateMilestoneButtonVisible && (
          <>
            {!milestones.find(milestone => !milestone.isFinal) ? (
              <Button
                className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full text-sm font-medium'
                onClick={() => setIsCreateMilestoneModalVisible?.(true)}
              >
                Create new milestone
              </Button>
            ) : (
              <Button
                className='inline-flex border-transparent bg-black border-2 text-white px-5 py-1 transition-[0.3s_ease] rounded-full text-sm font-medium opacity-30'
                disabled
                title='It is not possible to create a new milestone yet, as the previous milestone has not been submitted'
              >
                Create new milestone
              </Button>
            )}
          </>
        )}
      </div>
      <hr className='mt-5' />
      <div className='flex flex-col mt-5 gap-2'>
        {milestones.length > 0 ? (
          milestones.map(milestone => {
            if (project) {
              return (
                <Milestone
                  key={milestone.id}
                  milestone={milestone}
                  projectLaunch={{ ...project.projectLaunch, project }}
                />
              );
            } else {
              return <Milestone key={milestone.id} milestone={milestone} />;
            }
          })
        ) : (
          <div className='flex flex-col items-center justify-center p-5 mt-5'>
            <span className='text-gray-500 font-medium mb-3'>
              No milestones have been created in this project yet
            </span>
            {isCreateMilestoneButtonVisible && (
              <Button
                className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full text-sm font-medium'
                onClick={() => setIsCreateMilestoneModalVisible?.(true)}
              >
                Create new milestone
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

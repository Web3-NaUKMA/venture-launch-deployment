import { FC } from 'react';
import { Milestone as MilestoneType } from '../../../types/milestone.types';
import Button from '../../atoms/Button/Button';
import Milestone from '../../molecules/Milestone/Milestone';
import { Project } from '../../../types/project.types';

export interface MilestonesGrid {
  setIsCreateMilestoneModalVisible?: (...args: any[]) => any;
  isCreateMilestoneButtonVisible?: boolean;
  milestones: MilestoneType[];
  project?: Project;
}

export const MilestonesGrid: FC<MilestonesGrid> = ({
  milestones,
  setIsCreateMilestoneModalVisible,
  isCreateMilestoneButtonVisible = true,
  project,
}) => {
  return (
    <div className='flex flex-col shadow-[0_0_15px_-7px_gray] bg-white w-full max-w-[1440px] rounded-xl mt-10'>
      <div className='flex items-center justify-between px-10 py-8'>
        <h3 className='font-serif text-2xl'>Project milestones</h3>
        {milestones.length > 0 && isCreateMilestoneButtonVisible && (
          <>
            {!milestones.find(milestone => !milestone.isFinal) ? (
              <Button
                className='inline-flex border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium'
                onClick={() => setIsCreateMilestoneModalVisible?.(true)}
              >
                Create new milestone
              </Button>
            ) : (
              <Button
                className='font-sans inline-flex border-transparent bg-zinc-900 border-2 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-medium opacity-30'
                disabled
                title='It is not possible to create a new milestone yet, as the previous milestone has not been submitted'
              >
                Create new milestone
              </Button>
            )}
          </>
        )}
      </div>
      <hr />
      <div className='flex flex-col px-10 py-5 gap-2'>
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
            <span className='text-gray-500 font-medium mb-5 font-mono'>
              No milestones have been created in this project yet
            </span>
            {isCreateMilestoneButtonVisible && (
              <Button
                className='font-sans inline-flex border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-medium'
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

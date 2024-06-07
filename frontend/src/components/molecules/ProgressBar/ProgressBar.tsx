import { FC, HTMLAttributes, useEffect, useState } from 'react';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress: number;
  goal: number;
  deadline?: Date;
}

const ProgressBar: FC<ProgressBarProps> = ({ progress, goal, deadline, ...props }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = Math.max(new Date(deadline || 0).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(difference / (24 * 60 * 60 * 1000)),
        hours: Math.floor((difference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
        minutes: Math.floor((difference % (60 * 60 * 1000)) / (60 * 1000)),
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div {...props}>
      <div className='w-full rounded-r-xl rounded-tl-xl h-[35px] overflow-hidden relative bg-stone-200'>
        <div
          className={`flex justify-left items-center bg-zinc-400 text-white h-full text-sm rounded-r-xl rounded-tl-xl`}
          style={{
            width: `calc(${Math.max(0, Math.min(100, (progress / goal) * 100))}% + 2px)`,
          }}
        >
          <span className='absolute h-full font-medium inline-flex items-center px-5'>
            {((progress / goal) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className='rounded-2xl bg-stone-100 w-full pt-10 -mt-8 pb-2'>
        <div className='grid grid-cols-[1fr_1fr_2fr] divide-x divide-zinc-400'>
          <div className='flex flex-col px-5 py-1.5'>
            <h4 className='font-semibold font-sans'>Raised</h4>
            <span className='flex gap-1'>
              <span>$</span>
              <span>{Number(progress).toLocaleString('uk')}</span>
            </span>
          </div>
          <div className='flex flex-col px-5 py-1.5'>
            <h4 className='font-semibold font-sans'>Goal</h4>
            <span className='flex gap-1'>
              <span>$</span>
              <span>{Number(goal).toLocaleString('uk')}</span>
            </span>
          </div>
          <div className='flex flex-col px-5 py-1.5 items-end'>
            <h4 className='font-semibold font-sans'>Time left</h4>
            <span>
              {timeLeft.days < 10 && '0'}
              {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
              {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
              {timeLeft.minutes}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

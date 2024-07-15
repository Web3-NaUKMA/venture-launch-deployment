import { Chart as ChartJS, CategoryScale } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { FC, HTMLAttributes } from 'react';

ChartJS.register(CategoryScale);

export interface UnlockProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  percentage: number;
}

const UnlockProgressBar: FC<UnlockProgressBarProps> = ({ percentage, ...props }) => {
  return (
    <div className='relative' {...props}>
      <div className='flex flex-col items-center justify-center absolute left-0 top-0 right-0 bottom-0'>
        <span className='text-[11px]'>Unlocked</span>
        <span className='font-semibold text-sm'>{Number(percentage.toFixed(2))}%</span>
      </div>
      <Chart
        type='doughnut'
        className='rotate-180'
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: 32,
          scales: {
            x: {
              display: false,
              border: {
                display: false,
              },
            },
          },
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: { enabled: false },
          },
        }}
        data={{
          labels: ['JAN'],
          datasets: [
            {
              data: [
                Math.max(0, Math.min(100, percentage)),
                100 - Math.max(0, Math.min(100, percentage)),
              ],
              backgroundColor: ['#8E9296', '#D8D8D8'],
              borderWidth: 0,
            },
          ],
        }}
      />
    </div>
  );
};

export default UnlockProgressBar;

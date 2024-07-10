import { Chart as ChartJS, CategoryScale } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { FC, HTMLAttributes } from 'react';
import { ChartStatisticsPeriod, shortenNumber } from 'utils/app.utils';
import Dropdown from 'components/atoms/Dropdown/Dropdown';

ChartJS.register(CategoryScale);

export interface GeneralChartData {
  period?: ChartStatisticsPeriod;
  labels: (string | number)[];
  datasets: number[][];
  growthPercentages: number[];
}

export interface GeneralChartProps extends HTMLAttributes<HTMLDivElement> {
  onStatisticsPeriodChanged?: (value: string) => void;
  data: GeneralChartData;
}

const GeneralChart: FC<GeneralChartProps> = ({
  data: { period = ChartStatisticsPeriod.LastYear, ...data },
  onStatisticsPeriodChanged,
  ...props
}) => {
  return (
    <div className='' {...props}>
      <div className='flex gap-2 justify-between items-center'>
        <div className='flex flex-col items-start'>
          <div className='flex justify-between items-center mb-1'>
            <h3 className='font-semibold'>General info:</h3>
          </div>
          <div className='flex mb-1'>
            <h3 className='text-3xl font-serif'>$12.7m</h3>
          </div>
          <div className='flex mb-3 gap-2'>
            <Dropdown
              className='flex items-center gap-1 cursor-pointer relative'
              options={[
                { name: 'Last year', value: ChartStatisticsPeriod.LastYear },
                { name: 'Last month', value: ChartStatisticsPeriod.LastMonth },
              ]}
              onValueChanged={onStatisticsPeriodChanged}
              defaultValue={period}
            />
          </div>
        </div>
        <div className='flex justify-end gap-4'>
          <div className='flex flex-col gap-1.5 items-start'>
            <div className='flex items-center gap-2'>
              <span className='w-2 aspect-square inline-flex rounded-full bg-[#00BE57]' />
              <h3 className='font-semibold text-sm'>Projects</h3>
            </div>
            <span className='inline-flex px-2 rounded-full font-medium bg-emerald-100 text-emerald-600 text-[10px]'>
              {data.growthPercentages[0] > 0 ? '+' : '-'}
              {shortenNumber(data.growthPercentages[0])}%
            </span>
          </div>
          <div className='flex flex-col gap-1.5 items-start'>
            <div className='flex items-center gap-2'>
              <span className='w-2 aspect-square inline-flex rounded-full bg-[#AF2CFF]' />
              <h3 className='font-semibold text-sm'>Users</h3>
            </div>
            <span className='inline-flex px-2 rounded-full font-medium bg-emerald-100 text-emerald-600 text-[10px]'>
              {data.growthPercentages[1] > 0 ? '+' : '-'}
              {shortenNumber(data.growthPercentages[1])}%
            </span>
          </div>
          <div className='flex flex-col gap-1.5 items-start'>
            <div className='flex items-center gap-2'>
              <span className='w-2 aspect-square inline-flex rounded-full bg-[#2C80FF]' />
              <h3 className='font-semibold text-sm'>Investments</h3>
            </div>
            <span className='inline-flex px-2 rounded-full font-medium bg-emerald-100 text-emerald-600 text-[10px]'>
              {data.growthPercentages[2] > 0 ? '+' : '-'}
              {shortenNumber(data.growthPercentages[2])}%
            </span>
          </div>
        </div>
      </div>

      <div className='flex flex-1'>
        <Chart
          type='line'
          className='border-dashed border border-zinc-200 rounded-xl pt-1'
          options={{
            onHover: (event, chartElement) => {
              if (event?.native?.target as HTMLElement | null) {
                if (chartElement.length > 0) {
                  (event.native?.target as HTMLElement).style.cursor = 'pointer';
                } else {
                  (event.native?.target as HTMLElement).style.cursor = 'default';
                }
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                border: {
                  dash: [6, 6],
                  display: false,
                },
                ticks: {
                  padding: 10,
                  font: {
                    size: 10,
                    family: 'IBM Plex Mono',
                  },
                },
              },
              y: {
                grid: {
                  lineWidth: 2,
                  color: '#00000020',
                },
                border: {
                  dash: [6, 6],
                  display: false,
                },
                ticks: {
                  padding: 10,
                  precision: 0,
                  font: {
                    size: 10,
                    family: 'IBM Plex Mono',
                  },
                  callback: value => {
                    return shortenNumber(value);
                  },
                },
                beginAtZero: true,
              },
            },
            plugins: { legend: { display: false }, title: { display: false } },
          }}
          data={{
            labels: data.labels,
            datasets: [
              {
                data: data.datasets[0],
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
                borderColor: '#00BE57',
                borderWidth: 2,
              },
              {
                data: data.datasets[1],
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
                borderColor: '#AF2CFF',
                borderWidth: 2,
              },
              {
                data: data.datasets[2],
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
                borderColor: '#2C80FF',
                borderWidth: 2,
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export default GeneralChart;

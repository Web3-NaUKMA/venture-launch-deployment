import { Chart as ChartJS, CategoryScale } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { FC, HTMLAttributes } from 'react';
import { ChartStatisticsPeriod, shortenNumber } from 'utils/app.utils';
import Dropdown from 'components/atoms/Dropdown/Dropdown';

ChartJS.register(CategoryScale);

export interface TotalInvestmentsChartData {
  period?: ChartStatisticsPeriod;
  labels: (string | number)[];
  datasets: number[][];
  growthPercentage: number;
}

export interface TotalInvestmentsChartProps extends HTMLAttributes<HTMLDivElement> {
  onStatisticsPeriodChanged?: (value: string) => void;
  data: TotalInvestmentsChartData;
}

const TotalInvestmentsChart: FC<TotalInvestmentsChartProps> = ({
  data: { period = ChartStatisticsPeriod.LastYear, ...data },
  onStatisticsPeriodChanged,
  ...props
}) => {
  return (
    <div className='' {...props}>
      <div className='flex justify-between items-center mb-1'>
        <h3 className='font-semibold'>Amount of funds invested:</h3>
      </div>
      <div className='flex mb-1'>
        <h3 className='text-3xl font-serif'>
          $
          {shortenNumber(
            (data?.datasets?.[0]?.[data?.datasets?.[0]?.length - 1] || 0) -
              (data?.datasets?.[0]?.[0] || 0),
          )}
        </h3>
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
        <span className='inline-flex items-center px-2 rounded-full font-medium bg-emerald-100 text-emerald-600 text-[10px]'>
          {data.growthPercentage > 0 ? '+' : '-'}
          {shortenNumber(data.growthPercentage)}%
        </span>
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
                stacked: true,
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
                stacked: true,
                grid: {
                  lineWidth: 2,
                  color: '#00000020',
                },
                border: {
                  dash: [6, 6],
                  display: false,
                },
                ticks: {
                  precision: 0,
                  padding: 10,
                  font: {
                    size: 10,
                    family: 'IBM Plex Mono',
                  },
                  callback: (value: any) => {
                    return `${value < 0 ? '-' : ''}$${shortenNumber(Math.abs(value))}`;
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
                tension: 0.4,
                backgroundColor: context => {
                  const { chart } = context as any;
                  const gradient = chart.ctx.createLinearGradient(
                    0,
                    chart?.chartArea?.top || 0,
                    0,
                    chart?.chartArea?.bottom || 0,
                  );
                  gradient.addColorStop(0, '#00BE5780');
                  gradient.addColorStop(1, '#00BE5720');
                  return gradient;
                },
                borderColor: '#00BE57',
                borderWidth: 2,
                fill: true,
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export default TotalInvestmentsChart;

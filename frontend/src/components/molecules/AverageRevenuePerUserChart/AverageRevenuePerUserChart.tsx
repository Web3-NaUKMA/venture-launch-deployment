import { Chart as ChartJS, CategoryScale } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { FC, HTMLAttributes } from 'react';
import { ChartStatisticsPeriod, shortenNumber } from 'utils/app.utils';
import Dropdown from 'components/atoms/Dropdown/Dropdown';

ChartJS.register(CategoryScale);

export interface AverageRevenuePerUserChartData {
  period?: ChartStatisticsPeriod;
  labels: (string | number)[];
  datasets: number[][];
  growthPercentage: number;
}

export interface AverageRevenuePerUserChartProps extends HTMLAttributes<HTMLDivElement> {
  onStatisticsPeriodChanged?: (value: string) => void;
  data: AverageRevenuePerUserChartData;
}

const AverageRevenuePerUserChart: FC<AverageRevenuePerUserChartProps> = ({
  data: { period = ChartStatisticsPeriod.LastYear, ...data },
  onStatisticsPeriodChanged,
  ...props
}) => {
  return (
    <div className='' {...props}>
      <div className='flex justify-between items-center mb-1'>
        <h3 className='font-semibold'>Average revenue per user:</h3>
      </div>
      <div className='flex mb-1'>
        <h3 className='text-3xl font-serif'>
          $
          {shortenNumber(
            Number(
              (
                (data?.datasets?.[0]?.reduce(
                  (previousValue: any, currentValue: any) => previousValue + Number(currentValue),
                  0,
                ) || 0) / (data?.datasets?.[0]?.length || 1)
              ).toFixed(2),
            ),
          )}
        </h3>
      </div>
      <div className='flex mb-3 gap-4'>
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
          type='bar'
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
                  padding: 10,
                  stepSize: 100,
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
                borderRadius: 3,
                backgroundColor: context => {
                  const { chart, datasetIndex, index } = context as any;
                  const ds = chart.data.datasets[datasetIndex];
                  const value = ds.data[index];
                  const y = chart.scales.y.getPixelForValue(value);
                  const meta = chart.getDatasetMeta(datasetIndex);
                  const data = meta.data[index];
                  if (y && data.base) {
                    const ctx = chart.ctx;
                    const gradient = ctx.createLinearGradient(
                      0,
                      y - (y - data.base) * 0.25,
                      0,
                      data.base,
                    );
                    gradient.addColorStop(0, '#7BCEB5');
                    gradient.addColorStop(1, '#69988A50');
                    return gradient;
                  }
                },
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export default AverageRevenuePerUserChart;

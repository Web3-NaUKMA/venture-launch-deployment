import { FC, HTMLAttributes } from 'react';
import { Chart as ChartJS, CategoryScale } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { ChartStatisticsPeriod, shortenNumber } from 'utils/app.utils';
import Dropdown from 'components/atoms/Dropdown/Dropdown';

ChartJS.register(CategoryScale);

export interface IncomeChartData {
  period?: ChartStatisticsPeriod;
  labels: (string | number)[];
  datasets: number[][];
  growthPercentages: number[];
}

export interface ChartProps extends HTMLAttributes<HTMLDivElement> {
  onStatisticsPeriodChanged?: (value: string) => void;
  data: IncomeChartData;
}

const IncomeChart: FC<ChartProps> = ({
  data: { period = ChartStatisticsPeriod.LastYear, ...data },
  onStatisticsPeriodChanged,
  ...props
}) => {
  return (
    <div
      className='flex flex-col rounded-xl border p-10 bg-white shadow-[0_0_15px_-7px_gray]'
      {...props}
    >
      <div className='flex justify-between items-center mb-1'>
        <h3 className='font-mono text-sm'>Income</h3>
        <h3 className='font-semibold'>P&L</h3>
      </div>
      <div className='flex mb-1'>
        <h3 className='text-2xl font-serif'>
          {/* {`${
            (data?.datasets?.[0]?.reduce(
              (previousValue: any, currentValue: any) => previousValue + Number(currentValue),
              0,
            ) || 0) +
              (data?.datasets?.[1]?.reduce(
                (previousValue: any, currentValue: any) => previousValue + Number(currentValue),
                0,
              ) || 0) <
            0
              ? `-$`
              : `$`
          }${shortenNumber(
            Math.abs(
              (data?.datasets?.[0]?.reduce(
                (previousValue: any, currentValue: any) => previousValue + Number(currentValue),
                0,
              ) || 0) +
                (data?.datasets?.[1]?.reduce(
                  (previousValue: any, currentValue: any) => previousValue + Number(currentValue),
                  0,
                ) || 0),
            ),
          )}`} */}
          3X
        </h3>
      </div>
      <div className='flex mb-3'>
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
      <div className='flex flex-1'>
        <Chart
          type='bar'
          className='border-dashed border border-zinc-200 rounded-xl pr-5 min-h-[300px]'
          plugins={[
            {
              id: 'horizontalLine',
              afterDatasetDraw: chart => {
                const {
                  ctx,
                  chartArea: { left, width },
                  scales: { y },
                } = chart;
                ctx.save();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 6;
                ctx.strokeRect(left, y.getPixelForValue(0), width, 0);
                ctx.save();
                ctx.strokeStyle = '#EEEEEE';
                ctx.lineWidth = 1;
                ctx.strokeRect(left - 10, y.getPixelForValue(0), width + 10, 0);
                ctx.restore();
                return true;
              },
            },
          ]}
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
                barPercentage: 0.9,
                categoryPercentage: 1,
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
              {
                data: data.datasets[1],
                borderRadius: 3,
                barPercentage: 0.9,
                categoryPercentage: 1,
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
                      data.base + (data.base - y) * 0.25,
                      0,
                      y,
                    );
                    gradient.addColorStop(0, '#B77C7C50');
                    gradient.addColorStop(1, '#FB7A7A');
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
export default IncomeChart;

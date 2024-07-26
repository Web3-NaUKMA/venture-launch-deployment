import axios, { HttpStatusCode } from 'axios';
import { ArrowDropDown, ChartBarIcon, InformationCircleIcon } from 'components/atoms/Icons/Icons';
import Spinner from 'components/atoms/Spinner/Spinner';
import DashboardInvestedProject from 'components/molecules/DashboardInvestedProject/DashboardInvestedProject';
import DashboardUnlock from 'components/molecules/DashboardUnlock/DashboardUnlock';
import IncomeChart, { IncomeChartData } from 'components/molecules/IncomeChart/IncomeChart';
import { useAuth } from 'hooks/auth.hooks';
import { useAppDispatch, useAppSelector } from 'hooks/redux.hooks';
import { FC, HTMLAttributes, useEffect, useState } from 'react';
import {
  fetchInvestedProjectLaunches,
  fetchLockedProjectLaunches,
  selectInvestedProjectLaunches,
  selectLockedProjectLaunches,
} from 'redux/slices/dashboard.slice';
import { ChartStatisticsPeriod, shortenNumber } from 'utils/app.utils';

export interface StartupOrInvestorDashboardProps extends HTMLAttributes<HTMLDivElement> {}

const StartupOrInvestorDashboard: FC<StartupOrInvestorDashboardProps> = ({ ...props }) => {
  const lockedProjectLaunches = useAppSelector(selectLockedProjectLaunches);
  const investedProjectLaunches = useAppSelector(selectInvestedProjectLaunches);
  const dispatch = useAppDispatch();
  const { authenticatedUser } = useAuth();
  const [incomeChartData, setIncomeChartData] = useState<IncomeChartData>({
    period: ChartStatisticsPeriod.LastYear,
    labels: [],
    datasets: [],
    growthPercentages: [0, 0],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [areLockedProjectLaunchesLoaded, setAreLockedProjectLaunchesLoaded] = useState(false);
  const [areInvestedProjectLaunchesLoaded, setAreInvestedProjectLaunchesLoaded] = useState(false);

  useEffect(() => {
    if (authenticatedUser) {
      dispatch(
        fetchLockedProjectLaunches({
          onSuccess: () => setAreLockedProjectLaunchesLoaded(true),
          onError: () => setAreLockedProjectLaunchesLoaded(true),
        }),
      );
      dispatch(
        fetchInvestedProjectLaunches({
          onSuccess: () => setAreInvestedProjectLaunchesLoaded(true),
          onError: () => setAreInvestedProjectLaunchesLoaded(true),
        }),
      );
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (areLockedProjectLaunchesLoaded && areInvestedProjectLaunchesLoaded) {
      setIsLoaded(true);
    }
  }, [areLockedProjectLaunchesLoaded, areInvestedProjectLaunchesLoaded]);

  useEffect(() => {
    updateIncomeChart(incomeChartData.period || ChartStatisticsPeriod.LastYear);
  }, []);

  const updateIncomeChart = async (period: ChartStatisticsPeriod) => {
    const response: any = await axios.get(`/users`);
    switch (period) {
      case ChartStatisticsPeriod.LastYear:
        if (response.status === HttpStatusCode.Ok) {
          const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
          const dates = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(
            number =>
              new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() - number)),
          );

          const labels = dates.map(date => formatter.format(date).toUpperCase());
          const datasets: number[][] = [
            [100, 200, 357, 154, 51, 616, 124, 512, 64, 131, 146, 400],
            [-200, -150, -300, -124, -591, -680, -100, -20, -130, -200, -441, -140],
          ];

          const growthPercentages = [
            Number(
              ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 1)) * 100).toFixed(2),
            ),
            Number(
              ((datasets[1][datasets[1].length - 1] / (datasets[1][0] || 1)) * 100).toFixed(2),
            ),
          ];

          setIncomeChartData({ labels, datasets, growthPercentages });
        }
        break;
      case ChartStatisticsPeriod.LastMonth:
        if (response.status === HttpStatusCode.Ok) {
          const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
          const dates = [
            new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 25 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
          ];
          const labels = dates.map(
            date => `${date.getDate()} ${formatter.format(date).toUpperCase()}`,
          );
          const datasets: number[][] = [
            [124, 201, 20, 232, 372, 412, 291],
            [-20, -402, -31, -95, -143, -252, -312],
          ];
          const growthPercentages = [
            Number(
              ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 1)) * 100).toFixed(2),
            ),
            Number(
              ((datasets[1][datasets[1].length - 1] / (datasets[1][0] || 1)) * 100).toFixed(2),
            ),
          ];

          setIncomeChartData({ labels, datasets, growthPercentages });
        }
        break;
    }

    if (areLockedProjectLaunchesLoaded && areInvestedProjectLaunchesLoaded) {
      setIsLoaded(true);
    }
  };

  const handleIncomeChartStatisticsPeriodChanged = async (period: string) => {
    setIsLoaded(false);
    await updateIncomeChart(period as ChartStatisticsPeriod);
  };

  return isLoaded ? (
    <div className='grid min-[1440px]:grid-cols-[1fr_1.66fr_1.2fr] gap-10 flex-1' {...props}>
      <div className='flex flex-col gap-5 flex-1'>
        <div className='rounded-xl px-4 py-3 shadow-[0_0_15px_-7px_grey] flex justify-between items-center bg-white flex-1'>
          <h4 className='font-sans font-semibold'>Participations</h4>
          <span className='font-mono text-xl font-light'>
            {
              investedProjectLaunches
                .map(projectLaunch => ({
                  ...projectLaunch,
                  allocation:
                    projectLaunch?.projectLaunchInvestments?.reduce(
                      (previousValue, currentValue) =>
                        previousValue +
                        (currentValue.investor?.id === authenticatedUser?.id
                          ? Number(currentValue.amount)
                          : 0),
                      0,
                    ) || 0,
                }))
                .filter(projectLaunch => projectLaunch.allocation > 0).length
            }
          </span>
        </div>
        <h3 className='font-mono'>Latest projects:</h3>
        <div className='flex flex-1 relative min-h-[500px] w-[calc(100%_+_1.5rem_+_15px)] -ms-3'>
          <div className='flex flex-col absolute overflow-y-scroll top-0 left-0 right-0 bottom-0 with-scrollbar px-3 pb-3 flex-1'>
            <div className='flex flex-col relative gap-4 flex-1'>
              {investedProjectLaunches
                .map(projectLaunch => ({
                  ...projectLaunch,
                  allocation:
                    projectLaunch?.projectLaunchInvestments?.reduce(
                      (previousValue, currentValue) =>
                        previousValue +
                        (currentValue.investor?.id === authenticatedUser?.id
                          ? Number(currentValue.amount)
                          : 0),
                      0,
                    ) || 0,
                }))
                .filter(projectLaunch => projectLaunch.allocation > 0)
                .map(projectLaunch => (
                  <DashboardInvestedProject
                    key={projectLaunch.id}
                    className='flex bg-white rounded-xl shadow-[0_0_15px_-7px_grey] p-3 justify-between items-center'
                    projectLaunch={projectLaunch}
                    allocation={projectLaunch.allocation}
                  />
                ))}
              {!investedProjectLaunches?.length && (
                <div className='flex flex-1 border-2 border-stone-300 border-dashed rounded-xl items-center justify-center'>
                  <span className='text-center p-5 text-sm font-medium font-mono text-stone-400'>
                    There are no locked projects where you have invested in yet
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-5'>
        <div className='grid min-[1440px]:grid-cols-[1fr_1.2fr] gap-5'>
          <div className='flex flex-col shadow-[0_0_15px_-7px_grey] bg-white p-3 rounded-xl'>
            <h3 className='font-semibold text-sm'>My own funds invested</h3>
            <InformationCircleIcon className='size-4 text-stone-500 mt-2' />
            <div className='flex mt-2 justify-between items-end'>
              <h3 className='text-2xl font-serif'>
                $
                {shortenNumber(
                  investedProjectLaunches.reduce(
                    (previousValue, currentValue) =>
                      previousValue +
                      Number(
                        currentValue?.projectLaunchInvestments?.reduce(
                          (p, c) =>
                            p + (c.investor?.id === authenticatedUser?.id ? Number(c.amount) : 0),
                          0,
                        ) || 0,
                      ),
                    0,
                  ),
                )}
              </h3>
              <ChartBarIcon className='size-4 fill-stone-300 text-stone-300 m-1' />
            </div>
          </div>
          <div className='flex flex-col shadow-[0_0_15px_-7px_grey] bg-white p-3 rounded-xl'>
            <h3 className='font-semibold text-sm'>Amount of funds invested on platform</h3>
            <div className='flex items-center mt-2 gap-1 cursor-pointer'>
              <p className='font-mono text-xs'>Last year</p>
              <ArrowDropDown className='size-4 text-stone-600 mt-0.5' />
            </div>
            <div className='flex mt-2 justify-between items-end'>
              <h3 className='text-2xl font-serif'>
                $
                {shortenNumber(
                  investedProjectLaunches.reduce(
                    (previousValue, currentValue) =>
                      previousValue +
                      Number(
                        currentValue?.projectLaunchInvestments?.reduce(
                          (p, c) => p + Number(c.amount),
                          0,
                        ) || 0,
                      ),
                    0,
                  ),
                )}
              </h3>
              <ChartBarIcon className='size-4 fill-stone-300 text-stone-300 m-1' />
            </div>
          </div>
        </div>
        <IncomeChart
          className='flex flex-col rounded-xl border p-3 bg-white shadow-[0_0_15px_-7px_gray] flex-1'
          onStatisticsPeriodChanged={handleIncomeChartStatisticsPeriodChanged}
          data={incomeChartData}
        />
      </div>
      <div className='flex flex-col'>
        <div className='flex flex-1 relative w-[calc(100%_+_1.5rem_+_15px)] -ms-3 min-h-[300px]'>
          <div className='flex flex-col absolute overflow-y-scroll top-0 left-0 right-0 bottom-0 with-scrollbar px-3'>
            <div className='flex flex-col relative gap-4 flex-1'>
              {lockedProjectLaunches.map(projectLaunch => (
                <DashboardUnlock
                  key={projectLaunch.id}
                  className='flex bg-white rounded-xl shadow-[0_0_15px_-7px_grey] p-3 items-center gap-3 justify-between'
                  projectLaunch={projectLaunch}
                />
              ))}
              {!lockedProjectLaunches?.length && (
                <div className='flex flex-1 border-2 border-stone-300 border-dashed rounded-xl items-center justify-center'>
                  <span className='text-center p-5 text-sm font-medium font-mono text-stone-400'>
                    There are no locked projects where you are participating
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className='max-w-[1440px] flex flex-col items-center justify-center flex-1 gap-5 w-full'>
      <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
      <p className='text-center font-mono'>Loading the dashboard for you</p>
    </div>
  );
};

export default StartupOrInvestorDashboard;

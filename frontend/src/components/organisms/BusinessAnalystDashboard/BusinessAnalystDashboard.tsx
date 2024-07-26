import axios, { HttpStatusCode } from 'axios';
import Spinner from 'components/atoms/Spinner/Spinner';
import AverageRevenuePerUserChart, {
  AverageRevenuePerUserChartData,
} from 'components/molecules/AverageRevenuePerUserChart/AverageRevenuePerUserChart';
import GeneralChart, { GeneralChartData } from 'components/molecules/GeneralChart/GeneralChart';
import { Project } from 'components/molecules/Project/Project';
import TotalInvestmentsChart, {
  TotalInvestmentsChartData,
} from 'components/molecules/TotalInvestmentsChart/TotalInvestmentsChart';
import TotalUsersChart, {
  TotalUsersChartData,
} from 'components/molecules/TotalUsersChart/TotalUsersChart';
import { useAppDispatch, useAppSelector } from 'hooks/redux.hooks';
import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { fetchAllProjectLaunches, selectProjectLaunches } from 'redux/slices/dashboard.slice';
import { ProjectLaunch } from 'types/project-launch.types';
import { ChartStatisticsPeriod } from 'utils/app.utils';

export interface BusinessAnalystDashboardProps extends HTMLAttributes<HTMLDivElement> {}
export enum BusinessAnalystDashboardStatisticsPeriod {
  LastYear = 'last_year',
  LastMonth = 'last_month',
}

const BusinessAnalystDashboard: FC<BusinessAnalystDashboardProps> = ({ ...props }) => {
  const [filteredProjectLaunches, setFilteredProjectLaunches] = useState<ProjectLaunch[]>([]);
  const [loadingState, setLoadingState] = useState({
    isLoaded: false,
    isTotalUsersChartDataLoaded: false,
    isTotalInvestmentsChartDataLoaded: false,
    isAverageRevenuePerUserChartDataLoaded: false,
    isGeneralChartDataLoaded: false,
    isProjectLaunchesDataLoaded: false,
  });
  const [totalUsersChartData, setTotalUsersChartData] = useState<TotalUsersChartData>({
    period: ChartStatisticsPeriod.LastYear,
    labels: [],
    datasets: [],
    growthPercentage: 0,
  });
  const [totalInvestmentsChartData, setTotalInvestmentsChartData] =
    useState<TotalInvestmentsChartData>({
      period: ChartStatisticsPeriod.LastYear,
      labels: [],
      datasets: [],
      growthPercentage: 0,
    });
  const [averageRevenuePerUserChartData, setAverageRevenuePerUserChartData] =
    useState<AverageRevenuePerUserChartData>({
      period: ChartStatisticsPeriod.LastYear,
      labels: [],
      datasets: [],
      growthPercentage: 0,
    });
  const [generalChartData, setGeneralChartData] = useState<GeneralChartData>({
    period: ChartStatisticsPeriod.LastYear,
    labels: [],
    datasets: [],
    growthPercentages: [0, 0, 0],
  });
  const [search, setSearch] = useState<string>('');
  const projectLaunches = useAppSelector(selectProjectLaunches);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      fetchAllProjectLaunches(
        {},
        {
          onSuccess: data => {
            setFilteredProjectLaunches(data);
            setLoadingState({ ...loadingState, isProjectLaunchesDataLoaded: true });
          },
          onError: () => {
            setLoadingState({ ...loadingState, isProjectLaunchesDataLoaded: true });
          },
        },
      ),
    );
  }, []);

  useEffect(() => {
    setFilteredProjectLaunches(projectLaunches);

    if (search.trim()) {
      setFilteredProjectLaunches(
        projectLaunches.filter(projectLaunch =>
          projectLaunch.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search]);

  useEffect(() => {
    updateTotalUsersChart(totalUsersChartData.period || ChartStatisticsPeriod.LastYear);
    updateTotalInvestmentsChart(totalInvestmentsChartData.period || ChartStatisticsPeriod.LastYear);
    updateGeneralChart(generalChartData.period || ChartStatisticsPeriod.LastYear);
    updateAverageRevenuePerUserChart(
      averageRevenuePerUserChartData.period || ChartStatisticsPeriod.LastYear,
    );
  }, []);

  useEffect(() => {
    setLoadingState(prevState => ({ ...prevState, isGeneralChartDataLoaded: true }));
  }, [generalChartData.datasets]);

  useEffect(() => {
    setLoadingState(prevState => ({ ...prevState, isAverageRevenuePerUserChartDataLoaded: true }));
  }, [averageRevenuePerUserChartData.datasets]);

  useEffect(() => {
    setLoadingState(prevState => ({ ...prevState, isTotalInvestmentsChartDataLoaded: true }));
  }, [totalInvestmentsChartData.datasets]);

  useEffect(() => {
    setLoadingState(prevState => ({ ...prevState, isTotalUsersChartDataLoaded: true }));
  }, [totalUsersChartData.datasets]);

  useEffect(() => {
    if (
      loadingState.isTotalInvestmentsChartDataLoaded &&
      loadingState.isGeneralChartDataLoaded &&
      loadingState.isProjectLaunchesDataLoaded &&
      loadingState.isTotalUsersChartDataLoaded &&
      loadingState.isAverageRevenuePerUserChartDataLoaded &&
      !loadingState.isLoaded
    ) {
      setLoadingState({ ...loadingState, isLoaded: true });
    }
  }, [loadingState]);

  const updateTotalUsersChart = async (period: ChartStatisticsPeriod) => {
    const response: any = await axios.get(`/users`);
    switch (period) {
      case ChartStatisticsPeriod.LastYear:
        if (response.status === HttpStatusCode.Ok) {
          const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
          const dates = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(
            number =>
              new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() - number)),
          );

          const labels = dates.map(date => formatter.format(date).toUpperCase()[0]);
          const datasets: number[][] = [[]];
          dates.forEach(date =>
            datasets[0].push(
              response.data.filter(
                (user: any) =>
                  new Date(user.createdAt).getTime() <=
                  new Date(
                    new Date(new Date(date).setMonth(date.getMonth() + 1)).setDate(0),
                  ).getTime(),
              )?.length || 0,
            ),
          );

          const growthPercentage = Number(
            ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 1)) * 100).toFixed(2),
          );

          setTotalUsersChartData({ labels, datasets, growthPercentage });
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
          const datasets: number[][] = [[]];
          dates.forEach(date =>
            datasets[0].push(
              response.data.filter(
                (user: any) => new Date(user.createdAt).getTime() <= date.getTime(),
              ).length,
            ),
          );
          const growthPercentage = Number(
            ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 1)) * 100).toFixed(2),
          );

          setTotalUsersChartData({ labels, datasets, growthPercentage });
        }
        break;
    }
  };

  const updateTotalInvestmentsChart = async (period: ChartStatisticsPeriod) => {
    const response: any = await axios.get(
      `/project-launches/?relations.projectLaunchInvestments=true`,
    );
    switch (period) {
      case ChartStatisticsPeriod.LastYear:
        if (response.status === HttpStatusCode.Ok) {
          const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
          const dates = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(
            number =>
              new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() - number)),
          );

          const labels = dates.map(date => formatter.format(date).toUpperCase());
          const datasets: number[][] = [[]];
          const investments = response.data.flatMap(
            (projectLaunch: any) => projectLaunch.projectLaunchInvestments,
          );
          dates.forEach(date =>
            datasets[0].push(
              investments
                .filter(
                  (investment: any) =>
                    new Date(investment.createdAt).getTime() <=
                    new Date(
                      new Date(new Date(date).setMonth(date.getMonth() + 1)).setDate(0),
                    ).getTime(),
                )
                ?.reduce(
                  (previousValue: any, currentValue: any) =>
                    previousValue + Number(currentValue.amount),
                  0,
                ) || 0,
            ),
          );

          const growthPercentage = Number(
            ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 100)) * 100).toFixed(2),
          );

          setTotalInvestmentsChartData({ labels, datasets, growthPercentage });
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
          const datasets: number[][] = [[]];
          const investments = response.data.flatMap(
            (projectLaunch: any) => projectLaunch.projectLaunchInvestments,
          );
          dates.forEach(date =>
            datasets[0].push(
              investments
                .filter(
                  (investment: any) => new Date(investment.createdAt).getTime() <= date.getTime(),
                )
                ?.reduce(
                  (previousValue: any, currentValue: any) =>
                    previousValue + Number(currentValue.amount),
                  0,
                ) || 0,
            ),
          );

          const growthPercentage = Number(
            ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 100)) * 100).toFixed(2),
          );

          setTotalInvestmentsChartData({ labels, datasets, growthPercentage });
        }
        break;
    }
  };

  const updateGeneralChart = async (period: ChartStatisticsPeriod) => {
    const usersResponse: any = await axios.get(`/users`);
    const projectsResponse: any = await axios.get(
      `/project-launches/?relations.projectLaunchInvestments=true`,
    );
    switch (period) {
      case ChartStatisticsPeriod.LastYear:
        if (
          usersResponse.status === HttpStatusCode.Ok &&
          projectsResponse.status === HttpStatusCode.Ok
        ) {
          const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
          const dates = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(
            number =>
              new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() - number)),
          );

          const labels = dates.map(date => formatter.format(date).toUpperCase());
          const datasets: number[][] = [[], [], []];

          dates.forEach(date =>
            datasets[1].push(
              usersResponse.data.filter(
                (user: any) =>
                  new Date(user.createdAt).getTime() <=
                  new Date(
                    new Date(new Date(date).setMonth(date.getMonth() + 1)).setDate(0),
                  ).getTime(),
              )?.length || 0,
            ),
          );

          const investments = projectsResponse.data.flatMap(
            (projectLaunch: any) => projectLaunch.projectLaunchInvestments,
          );
          dates.forEach(date =>
            datasets[2].push(
              investments
                .filter(
                  (investment: any) =>
                    new Date(investment.createdAt).getTime() <=
                    new Date(
                      new Date(new Date(date).setMonth(date.getMonth() + 1)).setDate(0),
                    ).getTime(),
                )
                ?.reduce(
                  (previousValue: any, currentValue: any) =>
                    previousValue + Number(currentValue.amount),
                  0,
                ) || 0,
            ),
          );

          dates.forEach(date =>
            datasets[0].push(
              projectsResponse.data.filter(
                (projectLaunch: any) =>
                  new Date(projectLaunch.createdAt).getTime() <=
                  new Date(
                    new Date(new Date(date).setMonth(date.getMonth() + 1)).setDate(0),
                  ).getTime(),
              )?.length || 0,
            ),
          );

          const growthPercentages = [
            Number(
              ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 1)) * 100).toFixed(2),
            ),
            Number(
              ((datasets[1][datasets[1].length - 1] / (datasets[1][0] || 1)) * 100).toFixed(2),
            ),
            Number(
              ((datasets[2][datasets[2].length - 1] / (datasets[2][0] || 100)) * 100).toFixed(2),
            ),
          ];

          setGeneralChartData({ labels, datasets, growthPercentages });
        }
        break;
      case ChartStatisticsPeriod.LastMonth:
        if (
          usersResponse.status === HttpStatusCode.Ok &&
          projectsResponse.status === HttpStatusCode.Ok
        ) {
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
          const datasets: number[][] = [[], [], []];

          dates.forEach(date =>
            datasets[1].push(
              usersResponse.data.filter(
                (user: any) => new Date(user.createdAt).getTime() <= date.getTime(),
              )?.length || 0,
            ),
          );

          const investments = projectsResponse.data.flatMap(
            (projectLaunch: any) => projectLaunch.projectLaunchInvestments,
          );
          dates.forEach(date =>
            datasets[2].push(
              investments
                .filter(
                  (investment: any) => new Date(investment.createdAt).getTime() <= date.getTime(),
                )
                ?.reduce(
                  (previousValue: any, currentValue: any) =>
                    previousValue + Number(currentValue.amount),
                  0,
                ) || 0,
            ),
          );

          dates.forEach(date =>
            datasets[0].push(
              projectsResponse.data.filter(
                (projectLaunch: any) =>
                  new Date(projectLaunch.createdAt).getTime() <= date.getTime(),
              )?.length || 0,
            ),
          );

          const growthPercentages = [
            Number(
              ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 1)) * 100).toFixed(2),
            ),
            Number(
              ((datasets[1][datasets[1].length - 1] / (datasets[1][0] || 1)) * 100).toFixed(2),
            ),
            Number(
              ((datasets[2][datasets[2].length - 1] / (datasets[2][0] || 100)) * 100).toFixed(2),
            ),
          ];

          setGeneralChartData({ labels, datasets, growthPercentages });
        }
        break;
    }
  };

  const updateAverageRevenuePerUserChart = async (period: ChartStatisticsPeriod) => {
    const response: any = await axios.get(`/users`);
    switch (period) {
      case ChartStatisticsPeriod.LastYear:
        if (response.status === HttpStatusCode.Ok) {
          const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
          const dates = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(
            number =>
              new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() - number)),
          );

          const labels = dates.map(date => formatter.format(date).toUpperCase()[0]);
          const datasets: number[][] = [[0, 0, 0, 0, 0, 0, 0, 0, 580, 725, 650, 475]];
          const growthPercentage = Number(
            ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 100)) * 100).toFixed(2),
          );

          setAverageRevenuePerUserChartData({ labels, datasets, growthPercentage });
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
          const datasets: number[][] = [[250, 330, 300, 425, 375, 275, 475]];
          const growthPercentage = Number(
            ((datasets[0][datasets[0].length - 1] / (datasets[0][0] || 100)) * 100).toFixed(2),
          );

          setAverageRevenuePerUserChartData({ labels, datasets, growthPercentage });
        }
        break;
    }
  };

  const handleTotalUsersChartStatisticsPeriodChanged = async (period: string) => {
    await updateTotalUsersChart(period as ChartStatisticsPeriod);
  };

  const handleTotalInvestmentsChartStatisticsPeriodChanged = async (period: string) => {
    await updateTotalInvestmentsChart(period as ChartStatisticsPeriod);
  };

  const handleGeneralChartStatisticsPeriodChanged = async (period: string) => {
    await updateGeneralChart(period as ChartStatisticsPeriod);
  };

  const handleAverageRevenuePerUserChartStatisticsPeriodChanged = async (period: string) => {
    await updateAverageRevenuePerUserChart(period as ChartStatisticsPeriod);
  };

  return loadingState.isLoaded ? (
    <div className='grid min-[1440px]:grid-cols-[1fr_2.5fr] gap-10 flex-1 min-h-[80vh]' {...props}>
      <div className='flex flex-col flex-1 gap-4'>
        <div className='flex'>
          <input
            type='text'
            id='find_dashboard_project'
            className='border bg-stone-200 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono w-full'
            placeholder='Search by name...'
            defaultValue=''
            onChange={event => setSearch(event.target.value || '')}
          />
        </div>
        <div className='flex flex-col relative -ms-3 w-[calc(100%_+_1.5rem_+_15px)] flex-1'>
          <div className='flex flex-col absolute left-0 right-0 top-0 bottom-0 with-scrollbar overflow-y-scroll px-3 flex-1'>
            <div className='flex flex-col flex-1 gap-3'>
              {filteredProjectLaunches.map(projectLaunch => (
                <Project
                  key={projectLaunch.id}
                  project={projectLaunch}
                  variant='tiny'
                  className='flex flex-col justify-between items-start bg-white py-3.5 px-3.5 rounded-xl shadow-[0_0_15px_-7px_gray]'
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col flex-1 gap-5'>
        <div className='grid lg:grid-cols-[1fr_2fr] gap-5 h-1/2'>
          <TotalUsersChart
            className='flex flex-col rounded-xl border p-3 bg-white shadow-[0_0_15px_-7px_gray] flex-1'
            onStatisticsPeriodChanged={handleTotalUsersChartStatisticsPeriodChanged}
            data={totalUsersChartData}
          />
          <TotalInvestmentsChart
            className='flex flex-col rounded-xl border p-3 bg-white shadow-[0_0_15px_-7px_gray] flex-1'
            onStatisticsPeriodChanged={handleTotalInvestmentsChartStatisticsPeriodChanged}
            data={totalInvestmentsChartData}
          />
        </div>
        <div className='grid lg:grid-cols-[2fr_1fr] gap-5 h-1/2'>
          <GeneralChart
            className='flex flex-col rounded-xl border p-3 bg-white shadow-[0_0_15px_-7px_gray] flex-1'
            onStatisticsPeriodChanged={handleGeneralChartStatisticsPeriodChanged}
            data={generalChartData}
          />
          <AverageRevenuePerUserChart
            className='flex flex-col rounded-xl border p-3 bg-white shadow-[0_0_15px_-7px_gray] flex-1'
            onStatisticsPeriodChanged={handleAverageRevenuePerUserChartStatisticsPeriodChanged}
            data={averageRevenuePerUserChartData}
          />
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

export default BusinessAnalystDashboard;

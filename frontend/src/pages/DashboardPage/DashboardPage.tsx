import BusinessAnalystDashboard from 'components/organisms/BusinessAnalystDashboard/BusinessAnalystDashboard';
import StartupOrInvestorDashboard from 'components/organisms/SturtupOrInvestorDashboardSection/StartupOrInvestorDashboard';
import { useAuth } from 'hooks/auth.hooks';
import { FC } from 'react';
import { UserRoleEnum } from 'types/enums/user-role.enum';

const DashboardPage: FC = () => {
  const { authenticatedUser } = useAuth();

  return (
    <div className='flex mt-3 flex-col justify-start align-center mb-10 flex-1'>
      <div className='flex flex-col max-w-[1440px] flex-1'>
        {authenticatedUser &&
          (!authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst) ? (
            <div className='px-6 flex flex-col flex-1'>
              <h4 className='px-2 text-3xl font-serif mb-10'>Dashboard</h4>
              <StartupOrInvestorDashboard />
            </div>
          ) : (
            <div className='px-6 flex flex-col flex-1'>
              <h4 className='px-2 text-3xl font-serif mb-10'>Dashboard</h4>
              <BusinessAnalystDashboard />
            </div>
          ))}
      </div>
    </div>
  );
};

export default DashboardPage;

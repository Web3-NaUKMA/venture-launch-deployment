import { FC, useEffect, useState } from 'react';
import Modal, { IModalProps } from '../../molecules/Modal/Modal';
import { IProjectLaunch } from '../../../types/project-launch.types';
import Button from '../../atoms/Button/Button';
import axios, { HttpStatusCode } from 'axios';

export interface IProjectLaunchInfoModalProps extends IModalProps {
  projectLaunch: IProjectLaunch;
  setIsCreateProjectLaunchInvestmentModalVisible: (...args: any[]) => any;
}

const ProjectLaunchInfoModal: FC<IProjectLaunchInfoModalProps> = ({
  projectLaunch,
  title,
  buttons,
  children,
  setIsCreateProjectLaunchInvestmentModalVisible,
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = new Date(projectLaunch.fundraiseDeadline).getTime() - Date.now();
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
    <Modal title={title} buttons={buttons} className='max-w-[1024px]'>
      <div>
        <div className='grid md:grid-cols-2 gap-5'>
          <div className='flex flex-col'>
            <div className='flex items-center mb-5'>
              <img
                src='/project-logo.png'
                className='translate-x-[-32px] translate-y-[-32px] mb-[-64px] mr-[-64px]'
              />
              <h4 className='font-bold text-xl ms-5 text-gray-600 font-serif'>
                {projectLaunch.name}
              </h4>
            </div>
            {!projectLaunch.isFundraised ? (
              <>
                <div className='font-medium text-gray-700 text-lg'>
                  <h4>
                    Time left:{' '}
                    <span className='ms-1'>
                      {timeLeft.days < 10 && '0'}
                      {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
                      {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
                      {timeLeft.minutes}m
                    </span>
                  </h4>
                </div>
                <Button
                  className='inline-flex text-center font-medium justify-center mt-4 border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full max-w-[300px]'
                  onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                >
                  Invest Now
                </Button>
              </>
            ) : (
              <span className='text-gray-500'>
                The money for this project has already been raised
              </span>
            )}
          </div>
          <div className='flex flex-col h-full'>
            <div className='shadow-[0_0_7px_0px_silver] mb-5 font-medium rounded-lg px-5 py-2 w-full flex flex-col gap-y-2'>
              <div className='flex'>
                <div className='w-1/2'>Deal structure</div>
                <div className='w-1/2'>Token</div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Funding goal</div>
                <div className='w-1/2'>
                  <span>
                    <span className='me-[2px]'>$</span>
                    {projectLaunch.fundraiseAmount}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Round name</div>
                <div className='w-1/2'>{JSON.parse(projectLaunch.roundDetails).round} round</div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Valuation</div>
                <div className='w-1/2'>
                  <span>
                    <span className='me-[2px]'>$</span>
                    {JSON.parse(projectLaunch.roundDetails).valuation}
                  </span>
                </div>
              </div>
            </div>
            <div className='w-full'>
              <div className='w-full border border-gray-400 rounded-full h-[30px]'>
                <div
                  className={`flex justify-center items-center bg-neutral-500 text-white h-[30px] text-xs mt-[-1px] ms-[-1px] rounded-full`}
                  style={{
                    width: `calc(${Math.max(
                      0,
                      Math.min(
                        100,
                        (projectLaunch.fundraiseProgress / projectLaunch.fundraiseAmount) * 100,
                      ),
                    )}% + 2px)`,
                  }}
                >
                  <span className='font-medium bg-neutral-500 rounded-full'>
                    {(
                      (projectLaunch.fundraiseProgress / projectLaunch.fundraiseAmount) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between font-semibold mt-1'>
                <span>
                  <span className='me-[2px]'>$</span>
                  {projectLaunch.fundraiseProgress}
                </span>
                <span>
                  <span className='me-[2px]'>$</span>
                  {projectLaunch.fundraiseAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='mb-5'>
          <h3 className='font-bold font-serif text-xl mb-2 mt-5'>Description</h3>
          <p className='font-serif'>{projectLaunch.description}</p>
        </div>
        <hr />
        <div className='mb-5'>
          <h3 className='font-bold font-serif text-xl mb-2 mt-5'>Team</h3>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-3'>
            {!projectLaunch.team?.length && (
              <span className='text-sm text-gray-500'>
                No information about team members was added for this project
              </span>
            )}
            {projectLaunch.team.map((member: any, index: number) => (
              <div className='border rounded-xl p-3 flex justify-start' key={index}>
                <img
                  src={`${import.meta.env.VITE_BACKEND_HOST}:${
                    import.meta.env.VITE_BACKEND_PORT
                  }/file?file=${member.image}`}
                  style={{
                    width: '35%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    maxWidth: '128px',
                  }}
                  className='me-4 rounded-full'
                />
                <div className='flex flex-col w-full'>
                  <h5 className='font-bold text-lg'>{member.name}</h5>
                  <p className='font-medium text-gray-500'>{member.position}</p>
                  <hr className='my-2' />
                  <p className='text-gray-500 text-sm'>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className='mb-5'>
          <h3 className='font-bold font-serif text-xl mb-2 mt-5 flex'>Data room</h3>
          {!projectLaunch.projectDocuments?.length && (
            <span className='text-sm text-gray-500'>
              No documents have been added for this project.
            </span>
          )}
          {projectLaunch.projectDocuments.map((doc, index) => (
            <div
              className='border p-2 rounded-xl cursor-pointer hover:bg-slate-100 mb-2'
              key={index}
              onClick={async () => {
                const response = await axios.get(`file?file=${doc}`, {
                  responseType: 'blob',
                });
                if (response.status === HttpStatusCode.Ok) {
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', doc.split('/')[doc.split('/').length - 1]);
                  document.body.appendChild(link);
                  link.click();
                  if (link.parentNode) {
                    link.parentNode.removeChild(link);
                  }
                }
              }}
            >
              {doc.split('/')[doc.split('/').length - 1]}
            </div>
          ))}
        </div>
        <hr />
        <div className='mb-5'>
          <h3 className='font-bold font-serif text-xl mb-2 mt-5'>Business model</h3>
          <p className='font-serif'>{projectLaunch.businessModel}</p>
        </div>
        <hr />
        <div className='mb-5'>
          <h3 className='font-bold font-serif text-xl mb-2 mt-5'>Tokenomics</h3>
          <p className='font-serif'>{projectLaunch.tokenomics}</p>
        </div>
        <hr />
        <div>
          <h3 className='font-bold font-serif text-xl mb-5 mt-5'>Round details</h3>
          <div className='grid md:grid-cols-2'>
            <div className='bg-neutral-100 px-5 py-2 font-medium'>
              <div className='flex'>
                <div className='w-1/2'>Ticket size: </div>
                <div className='w-1/2 text-end'>
                  <span>
                    <span className='me-[2px]'>$</span>
                    {JSON.parse(projectLaunch.roundDetails).ticketSize.from}
                  </span>{' '}
                  -{' '}
                  <span>
                    <span className='me-[2px]'>$</span>
                    {JSON.parse(projectLaunch.roundDetails).ticketSize.to}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Round: </div>
                <div className='w-1/2 text-end'>{JSON.parse(projectLaunch.roundDetails).round}</div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Deal structure: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).dealStructure}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Token price</div>
                <div className='w-1/2 text-end'>
                  <span>
                    {JSON.parse(projectLaunch.roundDetails).tokenPrice ? (
                      <>
                        <span className='me-[2px]'>$</span>
                        {JSON.parse(projectLaunch.roundDetails).tokenPrice}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Valuation</div>
                <div className='w-1/2 text-end'>
                  <span>
                    {JSON.parse(projectLaunch.roundDetails).valuation ? (
                      <>
                        <span className='me-[2px]'>$</span>
                        {JSON.parse(projectLaunch.roundDetails).valuation}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Unlock at TGE: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).unlockAtTGE
                    ? `${JSON.parse(projectLaunch.roundDetails).unlockAtTGE} %`
                    : '—'}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Lockup: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).lockup
                    ? `${JSON.parse(projectLaunch.roundDetails).lockup} months`
                    : '—'}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Vesting: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).vesting
                    ? `${JSON.parse(projectLaunch.roundDetails).vesting} months`
                    : '—'}
                </div>
              </div>
            </div>
            <div className='flex flex-col items-end justify-end'>
              {!projectLaunch.isFundraised && (
                <>
                  <Button
                    className='inline-flex text-center font-medium justify-center mb-4 border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full max-w-[300px]'
                    onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                  >
                    Invest Now
                  </Button>
                  <div className='font-medium text-gray-700 text-lg'>
                    <h4>
                      Time left:{' '}
                      <span className='ms-1'>
                        {timeLeft.days < 10 && '0'}
                        {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
                        {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
                        {timeLeft.minutes}m
                      </span>
                    </h4>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {children}
    </Modal>
  );
};

export default ProjectLaunchInfoModal;

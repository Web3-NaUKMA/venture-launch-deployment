import { FC, useEffect, useState } from 'react';
import Modal, { IModalProps } from '../../molecules/Modal/Modal';
import { IProjectLaunch } from '../../../types/project-launch.types';
import Button from '../../atoms/Button/Button';
import axios, { HttpStatusCode } from 'axios';
import {
  EmptyLogoIcon,
  FileIcon,
  ImageIcon,
  LinkedInIcon,
  PlanetIcon,
  ShareIcon,
  StarIcon,
  VideoIcon,
} from '../../atoms/Icons/Icons';
import { Link } from 'react-router-dom';
import { resolveImage } from '../../../utils/file.utils';
import ProgressBar from '../../molecules/ProgressBar/ProgressBar';

export interface IProjectLaunchInfoModalProps extends IModalProps {
  projectLaunch: IProjectLaunch;
  setIsCreateProjectLaunchInvestmentModalVisible: (...args: any[]) => any;
}

const ProjectLaunchInfoModal: FC<IProjectLaunchInfoModalProps> = ({
  projectLaunch,
  title,
  onClose,
  children,
  setIsCreateProjectLaunchInvestmentModalVisible,
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [projectDocuments, setProjectDocuments] = useState<(File | undefined)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = Math.max(
        0,
        new Date(projectLaunch.fundraiseDeadline).getTime() - Date.now(),
      );
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

  useEffect(() => {
    const request = async () => {
      setProjectDocuments(
        await Promise.all(
          projectLaunch.projectDocuments.map(document =>
            axios
              .get(`file?file=${document}`, {
                responseType: 'blob',
              })
              .then(response => {
                if (response.status === HttpStatusCode.Ok) {
                  return new File([response.data], document, response.data);
                }
              }),
          ),
        ),
      );
    };

    request().catch(console.log);
  }, []);

  return (
    <Modal title={title} onClose={onClose} className='max-w-[1024px]'>
      <div className='px-10 pt-4 pb-8'>
        <div className='flex justify-end gap-3 mb-4'>
          <button type='button'>
            <StarIcon className='size-5' />
          </button>
          <button type='button'>
            <ShareIcon className='size-5' />
          </button>
        </div>
        <div className='grid md:grid-cols-2 gap-5'>
          <div className='flex flex-col'>
            <div className='flex items-center mb-5'>
              <img
                src={resolveImage(projectLaunch.logo || '')}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = '/logo.png';
                }}
                className='w-[6em] aspect-square rounded-xl object-cover'
              />
              <h4 className='font-medium text-2xl ms-5 font-sans'>{projectLaunch.name}</h4>
            </div>
            {!projectLaunch.isFundraised ? (
              <>
                <div className='flex gap-2'>
                  <span className='font-bold font-sans text-lg mt-[5px]'>Time left:</span>
                  <span className='font-medium font-sans text-[22px]'>
                    {timeLeft.days < 10 && '0'}
                    {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
                    {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
                    {timeLeft.minutes}m
                  </span>
                </div>
                {projectLaunch.isApproved && !projectLaunch.isFundraised && (
                  <Button
                    className='inline-flex text-center font-medium justify-center mt-4 border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-2 transition-all duration-300 rounded-full max-w-[260px] text-lg'
                    onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                  >
                    Invest Now
                  </Button>
                )}
              </>
            ) : (
              <span className='text-gray-500 text-sm font-mono'>
                The money for this project has already been raised
              </span>
            )}
          </div>
          <div className='flex flex-col h-full'>
            <div className='shadow-[0_0_7px_0px_silver] mb-5 font-medium font-sans rounded-lg px-8 py-5 w-full flex flex-col text-lg gap-y-2'>
              <div className='grid grid-cols-[1fr_130px]'>
                <span>Deal structure</span>
                <span>Token</span>
              </div>
              <div className='grid grid-cols-[1fr_130px]'>
                <span>Funding goal</span>
                <span>
                  <span className='me-[2px]'>$</span>
                  {Number(projectLaunch.fundraiseAmount).toLocaleString('uk')}
                </span>
              </div>
              <div className='grid grid-cols-[1fr_130px]'>
                <div>Round name</div>
                <span>{JSON.parse(projectLaunch.roundDetails).round} round</span>
              </div>
              <div className='grid grid-cols-[1fr_130px]'>
                <div className='w-1/2'>Valuation</div>
                <span>
                  <span className='me-[2px]'>$</span>
                  {Number(JSON.parse(projectLaunch.roundDetails).valuation).toLocaleString('uk')}
                </span>
              </div>
            </div>
            <ProgressBar
              progress={projectLaunch.fundraiseProgress}
              goal={projectLaunch.fundraiseAmount}
              deadline={projectLaunch.fundraiseDeadline}
            />
          </div>
        </div>
        {/* TODO: Replace hidden to grid when partners logic will be implemented */}
        <h3 className='hidden font-serif font-semibold text-2xl my-10'>Backers & Partners</h3>
        <div className='hidden sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='border rounded-2xl p-5 text-sm relative'>
              <div className='w-3/4 h-[40px] rounded-lg bg-neutral-200 mb-3 flex justify-center items-center'>
                <EmptyLogoIcon className='size-5 text-neutral-400' />
              </div>
              <h4 className='font-sans font-bold'>Partner name</h4>
              <p className='font-sans leading-5 mt-1'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              </p>
              <Link to='https://google.com' className='absolute top-2 right-2'>
                <PlanetIcon className='size-5 text-neutral-600' />
              </Link>
            </div>
          ))}
        </div>
        <h3 className='font-serif font-semibold text-2xl my-10'>Description</h3>
        <div className='mb-10'>
          <p className='font-serif whitespace-pre-wrap'>{projectLaunch.description}</p>
        </div>
        <hr />
        <h3 className='font-serif font-semibold text-2xl my-10'>3x Capital Review</h3>
        <div className='mb-10'>
          {projectLaunch.businessAnalystReview ? (
            <p className='font-serif whitespace-pre-wrap'>{projectLaunch.businessAnalystReview}</p>
          ) : (
            <p className='font-mono text-stone-500 text-sm font-medium'>
              Business analyst has not given the review for this project launch yet
            </p>
          )}
        </div>
        <hr />
        <h3 className='font-serif font-semibold text-2xl my-10'>Team</h3>
        <div className='mb-10'>
          <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-3'>
            {!projectLaunch.team?.length && (
              <span className='text-sm text-gray-500 font-mono'>
                No information about team members was added for this project
              </span>
            )}
            {projectLaunch.team.map((member: any, index: number) => (
              <div
                className='border rounded-2xl p-3 flex justify-start items-start relative'
                key={index}
              >
                <Link to={member.linkedInUrl} className='absolute top-2 left-2'>
                  <LinkedInIcon className='size-4 text-neutral-600' />
                </Link>
                <img
                  src={resolveImage(member.image)}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = '/logo.png';
                  }}
                  className='me-4 rounded-full w-[40%] aspect-square object-cover max-w-[128px]'
                />
                <div className='flex flex-col w-full'>
                  <h5 className='font-bold'>{member.name}</h5>
                  <p className='font-semibold text-sm text-zinc-800'>{member.position}</p>
                  <span className='border-b border-black w-full my-2' />
                  <p className='text-xs whitespace-pre-wrap'>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <hr />
        <h3 className='font-serif font-semibold text-2xl my-10'>Data room</h3>
        <div className='mb-10'>
          {!projectLaunch.projectDocuments?.length && (
            <span className='text-sm text-gray-500 font-mono'>
              No documents have been added for this project.
            </span>
          )}
          <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-8'>
            {projectDocuments.map((file, index) => (
              <div className='flex flex-col' key={index}>
                <div
                  className='border border-zinc-900 p-2 rounded-xl cursor-pointer hover:bg-slate-100 mb-2 aspect-square flex items-center justify-center'
                  onClick={async () => {
                    if (file) {
                      const url = window.URL.createObjectURL(file);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute(
                        'download',
                        file?.name.split('/')[file?.name.split('/').length - 1],
                      );

                      document.body.appendChild(link);
                      link.click();
                      if (link.parentNode) {
                        link.parentNode.removeChild(link);
                      }
                    }
                  }}
                >
                  {file?.type.startsWith('image') ? (
                    <ImageIcon className='stroke size-10' />
                  ) : file?.type.startsWith('video') ? (
                    <VideoIcon className='stroke size-10' />
                  ) : (
                    <FileIcon className='stroke size-10' />
                  )}
                </div>
                <span className='text-center break-all'>
                  {file?.name.split('/')[file?.name.split('/').length - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <hr />
        <h3 className='font-serif font-semibold text-2xl my-10'>Business model</h3>
        <div className='mb-10'>
          <p className='font-serif whitespace-pre-wrap'>{projectLaunch.businessModel}</p>
        </div>
        <hr />
        <h3 className='font-serif font-semibold text-2xl my-10'>Tokenomics</h3>
        <div className='mb-10'>
          <p className='font-serif whitespace-pre-wrap'>{projectLaunch.tokenomics}</p>
        </div>
        <hr />
        <div>
          <h3 className='font-bold font-serif text-xl mb-5 mt-5'>Round details</h3>
          <div className='grid md:grid-cols-2'>
            <div className='bg-neutral-100 px-10 py-5 font-medium rounded-lg'>
              <div className='flex'>
                <div className='w-1/2'>Ticket size: </div>
                <div className='w-1/2 text-end'>
                  <span>
                    <span className='me-[2px]'>$</span>
                    {Number(JSON.parse(projectLaunch.roundDetails).ticketSize.from).toLocaleString(
                      'uk',
                    )}
                  </span>{' '}
                  -{' '}
                  <span>
                    <span className='me-[2px]'>$</span>
                    {Number(JSON.parse(projectLaunch.roundDetails).ticketSize.to).toLocaleString(
                      'uk',
                    )}
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
                        {Number(JSON.parse(projectLaunch.roundDetails).tokenPrice).toLocaleString(
                          'uk',
                        )}
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
                        {Number(JSON.parse(projectLaunch.roundDetails).valuation).toLocaleString(
                          'uk',
                        )}
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
                    ? `${Number(JSON.parse(projectLaunch.roundDetails).unlockAtTGE).toLocaleString('uk')} %`
                    : '—'}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Lockup: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).lockup
                    ? `${Number(JSON.parse(projectLaunch.roundDetails).lockup).toLocaleString('uk')} months`
                    : '—'}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Vesting: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).vesting
                    ? `${Number(JSON.parse(projectLaunch.roundDetails).vesting).toLocaleString('uk')} months`
                    : '—'}
                </div>
              </div>
            </div>
            <div className='flex flex-col items-end justify-end'>
              {!projectLaunch.isFundraised && (
                <>
                  {projectLaunch.isApproved && !projectLaunch.isFundraised && (
                    <Button
                      className='inline-flex text-center font-medium justify-center border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1.5 transition-all duration-300 rounded-full text-lg'
                      onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                    >
                      Invest Now
                    </Button>
                  )}
                  <div className='flex gap-2 mt-5'>
                    <span className='font-bold font-sans text-xl'>Time left:</span>
                    <span className='font-medium font-sans text-xl'>
                      {timeLeft.days < 10 && '0'}
                      {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
                      {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
                      {timeLeft.minutes}m
                    </span>
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

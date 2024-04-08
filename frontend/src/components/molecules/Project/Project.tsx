import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../../types/enums/app-routes.enum';
import Button from '../../atoms/Button/Button';
import { DotsIcon, EditIcon, RemoveIcon } from '../../atoms/Icons/Icons';
import { useOutsideClick } from '../../../hooks/dom.hooks';
import Modal from '../Modal/Modal';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import EditProjectModal from '../../organisms/EditProjectModal/EditProjectModal';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/auth.hooks';
import { UserRoleEnum } from '../../../types/enums/user-role.enum';
import { IProjectLaunch } from '../../../types/project-launch.types';
import {
  fetchAllProjectLaunches,
  removeProjectLaunch,
  updateProjectLaunch,
} from '../../../redux/slices/project-launch.slice';
import CreateInvestmentModal from '../../organisms/CreateInvestmentModal/CreateInvestmentModal';
import ProjectLaunchInfoModal from '../../organisms/ProjectLaunchInfoModal/ProjectLaunchInfoModal';

export interface IProjectProps {
  project: IProjectLaunch;
}

export const Project: FC<IProjectProps> = ({ project: projectLaunch }) => {
  const dispatch = useAppDispatch();
  const [isSettingsDropdownVisible, setIsSettingsDropdownVisible] = useState(false);
  const [isRemoveProjectModalVisible, setIsRemoveProjectModalVisible] = useState(false);
  const [isApproveProjectLaunchModalVisible, setIsApproveProjectLaunchModalVisible] =
    useState(false);
  const [isEditProjectModalVisible, setIsEditProjectModalVisible] = useState(false);
  const [
    isCreateProjectLaunchInvestmentModalVisible,
    setIsCreateProjectLaunchInvestmentModalVisible,
  ] = useState(false);
  const [isShowProjectLaunchInfoModalVisible, setIsShowProjectLaunchInfoModalVisible] =
    useState(false);
  const settingsDropdownRef = useOutsideClick(() => setIsSettingsDropdownVisible(false));
  const { authenticatedUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  const deleteProject = () => {
    dispatch(
      removeProjectLaunch(projectLaunch.id, {
        onSuccess: () => setIsRemoveProjectModalVisible(false),
      }),
    );
  };

  const approveProjectLaunch = () => {
    const formData = new FormData();
    formData.set('isApproved', 'true');

    dispatch(
      updateProjectLaunch(projectLaunch.id, formData, {
        onSuccess: () => setIsApproveProjectLaunchModalVisible(false),
      }),
    );
  };

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
    <>
      {isRemoveProjectModalVisible &&
        createPortal(
          <Modal
            title='Delete project'
            buttons={[
              { variant: 'danger', type: 'accept', name: 'Delete', action: () => deleteProject() },
              {
                type: 'close',
                name: 'Cancel',
                action: () => setIsRemoveProjectModalVisible(false),
              },
            ]}
            className='max-w-[596px]'
          >
            Are you sure you want to delete this project? You will not be able to restore the
            project after performing this operation.
          </Modal>,
          document.getElementById('root')!,
        )}
      {isApproveProjectLaunchModalVisible &&
        createPortal(
          <Modal
            title='Approve project launch'
            buttons={[
              { type: 'accept', name: 'Approve', action: () => approveProjectLaunch() },
              {
                type: 'close',
                name: 'Cancel',
                action: () => setIsApproveProjectLaunchModalVisible(false),
              },
            ]}
            className='max-w-[596px]'
          >
            Are you sure you want to approve this project launch?
          </Modal>,
          document.getElementById('root')!,
        )}
      {isEditProjectModalVisible &&
        createPortal(
          <EditProjectModal
            title='Edit project'
            buttons={[
              {
                type: 'accept',
                name: 'Save changes',
                action: () => setIsEditProjectModalVisible(false),
              },
              { type: 'close', name: 'Close', action: () => setIsEditProjectModalVisible(false) },
            ]}
            className='max-w-[596px]'
            project={projectLaunch}
          />,
          document.getElementById('root')!,
        )}
      {isCreateProjectLaunchInvestmentModalVisible &&
        createPortal(
          <CreateInvestmentModal
            title='Create investment'
            buttons={[
              {
                type: 'close',
                name: 'Close',
                action: () => setIsCreateProjectLaunchInvestmentModalVisible(false),
              },
              {
                type: 'accept',
                name: 'Create',
                action: () => {
                  dispatch(fetchAllProjectLaunches());
                  setIsCreateProjectLaunchInvestmentModalVisible(false);
                },
              },
            ]}
            projectLaunch={projectLaunch}
          />,
          document.getElementById('root')!,
        )}
      {isShowProjectLaunchInfoModalVisible &&
        createPortal(
          <ProjectLaunchInfoModal
            title=''
            buttons={[
              {
                type: 'close',
                name: 'Close',
                action: () => setIsShowProjectLaunchInfoModalVisible(false),
              },
            ]}
            projectLaunch={projectLaunch}
            setIsCreateProjectLaunchInvestmentModalVisible={
              setIsCreateProjectLaunchInvestmentModalVisible
            }
          />,
          document.getElementById('root')!,
        )}
      <div className='flex flex-col justify-between items-start bg-white py-7 px-14 rounded-xl shadow-[0_0_30px_-5px_#d5d5d5]'>
        <div className='flex flex-col w-full flex-1'>
          <div className='flex justify-between items-start pb-5 border-b'>
            <div className='flex items-center'>
              <img
                src='/project-logo.png'
                className='translate-x-[-30px] translate-y-[-30px] mb-[-60px] mr-[-60px]'
              />
              <h4 className='font-bold text-xl ms-5 text-gray-600 font-serif'>
                {projectLaunch.name}
              </h4>
            </div>
            <div className='flex items-center'>
              {projectLaunch.isApproved && !projectLaunch.isFundraised ? (
                <span className='font-medium text-white bg-red rounded-full text-xs bg-blue-500 px-2 py-0.5'>
                  Approved
                </span>
              ) : projectLaunch.isApproved &&
                projectLaunch.isFundraised &&
                projectLaunch.project?.isFinal ? (
                <span className='font-medium text-white bg-red rounded-full text-xs bg-emerald-500 px-2 py-0.5'>
                  Submitted
                </span>
              ) : projectLaunch.isApproved && projectLaunch.isFundraised ? (
                <span className='font-medium text-white bg-red rounded-full text-xs bg-orange-500 px-2 py-0.5'>
                  Funds raised
                </span>
              ) : (
                <span className='font-medium text-white bg-red rounded-full text-xs bg-slate-500 px-2 py-0.5'>
                  Under review
                </span>
              )}

              {authenticatedUser?.id ===
                (projectLaunch.author?.id ?? projectLaunch.authorId ?? '') &&
                authenticatedUser.role.includes(UserRoleEnum.Startup) && (
                  <div className='relative ms-2'>
                    <Button
                      className='rounded-full p-1 hover:bg-neutral-100 transition-[0.3s_ease]'
                      onClick={() => setIsSettingsDropdownVisible(true)}
                    >
                      <DotsIcon className='size-6' />
                    </Button>
                    {isSettingsDropdownVisible && (
                      <div
                        ref={settingsDropdownRef}
                        className='absolute bg-white mt-1 right-0 shadow p-1 rounded-md flex flex-col z-50'
                      >
                        {/* <Button
                        className='inline-flex items-center text-sm hover:bg-neutral-100 px-2 py-1 rounded-md font-medium text-gray-700 mb-1'
                        onClick={() => {
                          setIsEditProjectModalVisible(true);
                          setIsSettingsDropdownVisible(false);
                        }}
                      >
                        <EditIcon className='size-3.5 me-2' />
                        Edit
                      </Button> */}
                        <Button
                          className='inline-flex items-center text-sm hover:bg-neutral-100 px-2 py-1 rounded-md font-medium text-gray-700'
                          onClick={() => {
                            setIsRemoveProjectModalVisible(true);
                            setIsSettingsDropdownVisible(false);
                          }}
                        >
                          <RemoveIcon className='size-3.5 me-2' />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div className='py-5 font-serif text-gray-700 border-b flex flex-1'>
            {projectLaunch.description}
          </div>
          <div className='py-5 flex mb-5'>
            <h4 className='text-gray-600 font-medium text-lg me-5'>Progress </h4>
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
                  <span className='me-2'>Raised</span> <span className='me-[2px]'>$</span>
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
        <div className='flex justify-between items-center w-full'>
          {(!projectLaunch.isApproved || !projectLaunch.isFundraised) && (
            <div className='font-medium text-gray-700 text-lg'>
              <h4>
                Time left{' '}
                <span className='ms-4'>
                  {timeLeft.days < 10 && '0'}
                  {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
                  {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
                  {timeLeft.minutes}m
                </span>
              </h4>
            </div>
          )}
          <div className='flex'>
            {projectLaunch.isFundraised && projectLaunch.isApproved && projectLaunch.project && (
              <Link
                to={AppRoutes.DetailsProject.replace(':id', projectLaunch.project.id)}
                className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full'
              >
                Details
              </Link>
            )}
            <div className='flex'>
              <Button
                className='inline-flex ms-2 border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full'
                onClick={() => setIsShowProjectLaunchInfoModalVisible(true)}
              >
                Launch info
              </Button>
              {!projectLaunch.isFundraised && (
                <>
                  {!projectLaunch.isApproved &&
                    authenticatedUser?.role.find(role => role === UserRoleEnum.BusinessAnalyst) && (
                      <Button
                        className='inline-flex ms-2 border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full'
                        onClick={() => setIsApproveProjectLaunchModalVisible(true)}
                      >
                        Approve
                      </Button>
                    )}
                  {authenticatedUser?.role.find(
                    role => role === UserRoleEnum.Investor || role === UserRoleEnum.Startup,
                  ) &&
                    projectLaunch.isApproved && (
                      <Button
                        className='inline-flex ms-2 border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full'
                        onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                      >
                        Invest now
                      </Button>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

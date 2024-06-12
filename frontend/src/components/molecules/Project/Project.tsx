import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../../types/enums/app-routes.enum';
import Button from '../../atoms/Button/Button';
import { DotsIcon, EmptyLogoIcon, RemoveIcon, ShareIcon, StarIcon } from '../../atoms/Icons/Icons';
import { useOutsideClick } from '../../../hooks/dom.hooks';
import Modal from '../Modal/Modal';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/auth.hooks';
import { UserRoleEnum } from '../../../types/enums/user-role.enum';
import { IProjectLaunch } from '../../../types/project-launch.types';
import {
  fetchAllProjectLaunches,
  removeProjectLaunch,
} from '../../../redux/slices/project-launch.slice';
import CreateInvestmentModal from '../../organisms/CreateInvestmentModal/CreateInvestmentModal';
import ProjectLaunchInfoModal from '../../organisms/ProjectLaunchInfoModal/ProjectLaunchInfoModal';
import ProgressBar from '../ProgressBar/ProgressBar';
import { resolveImage } from '../../../utils/file.utils';
import ApproveProjectLaunchModal from '../../organisms/ApproveProjectLaunchModal/ApproveProjectLaunchModal';

export interface IProjectProps {
  project: IProjectLaunch;
  variant?: 'extended' | 'short';
}

export const Project: FC<IProjectProps> = ({ project: projectLaunch, variant = 'extended' }) => {
  const dispatch = useAppDispatch();
  const [isSettingsDropdownVisible, setIsSettingsDropdownVisible] = useState(false);
  const [isRemoveProjectModalVisible, setIsRemoveProjectModalVisible] = useState(false);
  const [isApproveProjectLaunchModalVisible, setIsApproveProjectLaunchModalVisible] =
    useState(false);
  const [
    isCreateProjectLaunchInvestmentModalVisible,
    setIsCreateProjectLaunchInvestmentModalVisible,
  ] = useState(false);
  const [isShowProjectLaunchInfoModalVisible, setIsShowProjectLaunchInfoModalVisible] =
    useState(false);
  const settingsDropdownRef = useOutsideClick(() => setIsSettingsDropdownVisible(false));
  const { authenticatedUser } = useAuth();

  const deleteProject = () => {
    dispatch(
      removeProjectLaunch(projectLaunch.id, {
        onSuccess: () => setIsRemoveProjectModalVisible(false),
      }),
    );
  };

  return (
    <>
      {isRemoveProjectModalVisible &&
        createPortal(
          <Modal
            title='Delete project'
            onClose={() => setIsRemoveProjectModalVisible(false)}
            className='max-w-[596px]'
          >
            <div className='px-10 py-8 flex flex-col'>
              <p className='font-mono'>
                Are you sure you want to delete this project? You will not be able to restore the
                project after performing this operation.
              </p>
              <div className='mt-8 flex gap-4'>
                <button
                  type='button'
                  className='inline-flex text-center justify-center items-center bg-red-500 hover:bg-red-400 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                  onClick={() => deleteProject()}
                >
                  Delete
                </button>
                <button
                  type='button'
                  className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                  onClick={() => setIsRemoveProjectModalVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>,
          document.getElementById('root')!,
        )}
      {isApproveProjectLaunchModalVisible &&
        createPortal(
          <ApproveProjectLaunchModal
            projectLaunch={projectLaunch}
            title={'Approve project launch'}
            onClose={() => setIsApproveProjectLaunchModalVisible(false)}
            onProcess={() => setIsApproveProjectLaunchModalVisible(false)}
          />,
          document.getElementById('root')!,
        )}
      {isCreateProjectLaunchInvestmentModalVisible &&
        createPortal(
          <CreateInvestmentModal
            title='Proceed with investment'
            onClose={() => setIsCreateProjectLaunchInvestmentModalVisible(false)}
            onProcess={() => {
              dispatch(fetchAllProjectLaunches());
              setIsCreateProjectLaunchInvestmentModalVisible(false);
            }}
            projectLaunch={projectLaunch}
          />,
          document.getElementById('root')!,
        )}
      {isShowProjectLaunchInfoModalVisible &&
        createPortal(
          <ProjectLaunchInfoModal
            title='Project launch info'
            onClose={() => setIsShowProjectLaunchInfoModalVisible(false)}
            projectLaunch={projectLaunch}
            setIsCreateProjectLaunchInvestmentModalVisible={
              setIsCreateProjectLaunchInvestmentModalVisible
            }
          />,
          document.getElementById('root')!,
        )}
      <div className='flex flex-col justify-between items-start bg-white py-7 px-14 rounded-xl shadow-[0_0_15px_-7px_gray]'>
        <div className='flex flex-col w-full flex-1'>
          <div className='flex justify-between items-start pb-5'>
            <div className='flex items-center w-full'>
              <img
                src={resolveImage(projectLaunch.logo || '')}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = '/logo.png';
                }}
                className='w-[6em] aspect-square rounded-xl object-cover'
              />
              <div className='flex flex-col ms-5 w-full'>
                <h4 className='font-semibold text-2xl'>{projectLaunch.name}</h4>
                {variant === 'short' && (
                  <div className='flex items-center gap-0.5 mt-3'>
                    {projectLaunch.approver !== null && !projectLaunch.isFundraised ? (
                      <span className='font-medium text-white bg-red rounded-full text-xs bg-blue-500 px-2 py-0.5'>
                        Approved
                      </span>
                    ) : projectLaunch.approver !== null &&
                      projectLaunch.isFundraised &&
                      projectLaunch.project?.isFinal ? (
                      <span className='font-medium text-white bg-red rounded-full text-xs bg-emerald-500 px-2 py-0.5'>
                        Submitted
                      </span>
                    ) : projectLaunch.approver !== null && projectLaunch.isFundraised ? (
                      <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-orange-500 px-2 py-0.5'>
                        Funds raised
                      </span>
                    ) : (
                      <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-slate-500 px-2 py-0.5'>
                        Under review
                      </span>
                    )}
                    <button
                      type='button'
                      className='ms-2 h-full rounded-full hover:bg-neutral-100 transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center'
                    >
                      <StarIcon className='size-5' />
                    </button>
                    <button
                      type='button'
                      className='rounded-full hover:bg-neutral-100 transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center'
                    >
                      <ShareIcon className='size-5' />
                    </button>
                    {authenticatedUser?.id ===
                      (projectLaunch.author?.id ?? projectLaunch.authorId ?? '') &&
                      authenticatedUser.role.includes(UserRoleEnum.Startup) && (
                        <div className='relative'>
                          <Button
                            className='rounded-full hover:bg-neutral-100 transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center'
                            onClick={() => setIsSettingsDropdownVisible(true)}
                          >
                            <DotsIcon className='size-6' />
                          </Button>
                          {isSettingsDropdownVisible && (
                            <div
                              ref={settingsDropdownRef}
                              className='absolute bg-white mt-1 right-0 shadow p-1 rounded-md flex flex-col z-50'
                            >
                              <Button
                                className='inline-flex items-center hover:bg-neutral-100 px-2 py-1 rounded-md font-medium'
                                onClick={() => {
                                  setIsRemoveProjectModalVisible(true);
                                  setIsSettingsDropdownVisible(false);
                                }}
                              >
                                <RemoveIcon className='size-4 me-2' />
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
              {variant === 'short' && (
                <div className='grid auto-cols-max gap-2'>
                  {projectLaunch.isFundraised &&
                    projectLaunch.approver !== null &&
                    projectLaunch.project && (
                      <Link
                        to={AppRoutes.DetailsProject.replace(':id', projectLaunch.project.id)}
                        className='inline-flex text-center justify-center items-center font-medium font-sans text-lg hover:border-transparent hover:bg-zinc-900 bg-transparent border-2 border-zinc-900 text-zinc-900 hover:text-white px-10 py-1 transition-all duration-300 rounded-full'
                      >
                        Details
                      </Link>
                    )}
                  <Button
                    className='inline-flex text-center justify-center items-center font-medium font-sans text-lg hover:border-transparent hover:bg-zinc-900 bg-transparent border-2 border-zinc-900 text-zinc-900 hover:text-white px-10 py-1 transition-all duration-300 rounded-full'
                    onClick={() => setIsShowProjectLaunchInfoModalVisible(true)}
                  >
                    Launch info
                  </Button>
                  {!projectLaunch.isFundraised && (
                    <>
                      {!projectLaunch.approver &&
                        authenticatedUser?.role.find(
                          role => role === UserRoleEnum.BusinessAnalyst,
                        ) && (
                          <Button
                            className='inline-flex text-center justify-center items-center font-medium font-sans text-lg border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1 transition-all duration-300 rounded-full'
                            onClick={() => setIsApproveProjectLaunchModalVisible(true)}
                          >
                            Approve
                          </Button>
                        )}
                      {authenticatedUser?.role.find(
                        role => role === UserRoleEnum.Investor || role === UserRoleEnum.Startup,
                      ) &&
                        projectLaunch.approver !== null && (
                          <Button
                            className='inline-flex text-center justify-center items-center font-medium font-sans text-lg border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1 transition-all duration-300 rounded-full'
                            onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                          >
                            Invest now
                          </Button>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
            {variant === 'extended' && (
              <div className='flex items-center gap-0.5'>
                {projectLaunch.approver !== null && !projectLaunch.isFundraised ? (
                  <span className='font-medium text-white bg-red rounded-full text-xs bg-blue-500 px-2 py-0.5'>
                    Approved
                  </span>
                ) : projectLaunch.approver !== null &&
                  projectLaunch.isFundraised &&
                  projectLaunch.project?.isFinal ? (
                  <span className='font-medium text-white bg-red rounded-full text-xs bg-emerald-500 px-2 py-0.5'>
                    Submitted
                  </span>
                ) : projectLaunch.approver !== null && projectLaunch.isFundraised ? (
                  <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-orange-500 px-2 py-0.5'>
                    Funds raised
                  </span>
                ) : (
                  <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-slate-500 px-2 py-0.5'>
                    Under review
                  </span>
                )}
                <button
                  type='button'
                  className='ms-2 h-full rounded-full hover:bg-neutral-100 transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center'
                >
                  <StarIcon className='size-5' />
                </button>
                <button
                  type='button'
                  className='rounded-full hover:bg-neutral-100 transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center'
                >
                  <ShareIcon className='size-5' />
                </button>
                {authenticatedUser?.id ===
                  (projectLaunch.author?.id ?? projectLaunch.authorId ?? '') &&
                  authenticatedUser.role.includes(UserRoleEnum.Startup) && (
                    <div className='relative'>
                      <Button
                        className='rounded-full hover:bg-neutral-100 transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center'
                        onClick={() => setIsSettingsDropdownVisible(true)}
                      >
                        <DotsIcon className='size-6' />
                      </Button>
                      {isSettingsDropdownVisible && (
                        <div
                          ref={settingsDropdownRef}
                          className='absolute bg-white mt-1 right-0 shadow p-1 rounded-md flex flex-col z-50'
                        >
                          <Button
                            className='inline-flex items-center hover:bg-neutral-100 px-2 py-1 rounded-md font-medium'
                            onClick={() => {
                              setIsRemoveProjectModalVisible(true);
                              setIsSettingsDropdownVisible(false);
                            }}
                          >
                            <RemoveIcon className='size-4 me-2' />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
          {variant === 'extended' && (
            <>
              <hr />
              <div className='py-5 font-serif text-gray-700 flex flex-1 whitespace-pre-wrap'>
                {projectLaunch.description}
              </div>
              <hr />
              {/* TODO: Replace hidden to grid when partners logic will be implemented */}
              <div className='hidden sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='border rounded p-5 relative'>
                    <div className='w-full h-[40px] rounded bg-neutral-200 mb-3 flex justify-center items-center'>
                      <EmptyLogoIcon className='size-5 text-neutral-400' />
                    </div>
                    <h4 className='font-sans font-bold text-xs'>Mocked Technology partner</h4>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className='py-5 flex'>
            <ProgressBar
              className='w-full'
              progress={projectLaunch.fundraiseProgress}
              goal={projectLaunch.fundraiseAmount}
              deadline={new Date(projectLaunch.fundraiseDeadline)}
            />
          </div>
        </div>
        {variant === 'extended' && (
          <div className='grid w-full gap-2 grid-flow-col auto-cols-fr'>
            {projectLaunch.isFundraised &&
              projectLaunch.approver !== null &&
              projectLaunch.project && (
                <Link
                  to={AppRoutes.DetailsProject.replace(':id', projectLaunch.project.id)}
                  className='inline-flex text-center justify-center items-center font-medium font-sans text-lg hover:border-transparent hover:bg-zinc-900 bg-transparent border-2 border-zinc-900 text-zinc-900 hover:text-white px-10 py-1 transition-all duration-300 rounded-full'
                >
                  Details
                </Link>
              )}
            <Button
              className='inline-flex text-center justify-center items-center font-medium font-sans text-lg hover:border-transparent hover:bg-zinc-900 bg-transparent border-2 border-zinc-900 text-zinc-900 hover:text-white px-10 py-1 transition-all duration-300 rounded-full'
              onClick={() => setIsShowProjectLaunchInfoModalVisible(true)}
            >
              Launch info
            </Button>
            {!projectLaunch.isFundraised && (
              <>
                {!projectLaunch.approver &&
                  authenticatedUser?.role.find(role => role === UserRoleEnum.BusinessAnalyst) && (
                    <Button
                      className='inline-flex text-center justify-center items-center font-medium font-sans text-lg border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1 transition-all duration-300 rounded-full'
                      onClick={() => setIsApproveProjectLaunchModalVisible(true)}
                    >
                      Approve
                    </Button>
                  )}
                {authenticatedUser?.role.find(
                  role => role === UserRoleEnum.Investor || role === UserRoleEnum.Startup,
                ) &&
                  projectLaunch.approver !== null && (
                    <Button
                      className='inline-flex text-center justify-center items-center font-medium font-sans text-lg border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1 transition-all duration-300 rounded-full'
                      onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                    >
                      Invest now
                    </Button>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

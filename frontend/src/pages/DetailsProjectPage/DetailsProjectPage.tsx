import { FC, useEffect, useState } from 'react';
import { MilestonesGrid } from '../../components/organisms/MilestonesGrid/MilestonesGrid';
import { useNavigate, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchProject,
  // removeProject,
  selectProject,
  setProject,
  updateProject,
} from '../../redux/slices/project.slice';
import Button from '../../components/atoms/Button/Button';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import Modal from '../../components/molecules/Modal/Modal';
// import EditProjectModal from '../../components/organisms/EditProjectModal/EditProjectModal';
import { createPortal } from 'react-dom';
import CreateMilestoneModal from '../../components/organisms/CreateMilestoneModal/CreateMilestoneModal';
import { useAuth } from '../../hooks/auth.hooks';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createNftTransaction, getIPFSUrlForProject } from '../../utils/nft.utils';
import * as web3 from '@solana/web3.js';
import ProjectLaunchInfoModal from '../../components/organisms/ProjectLaunchInfoModal/ProjectLaunchInfoModal';

const DetailsProjectPage: FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  // const navigate = useNavigate();
  const project = useAppSelector(selectProject);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitProjectModalVisible, setIsSubmitProjectModalVisible] = useState(false);
  // const [isRemoveProjectModalVisible, setIsRemoveProjectModalVisible] = useState(false);
  // const [isEditProjectModalVisible, setIsEditProjectModalVisible] = useState(false);
  const [isShowProjectLaunchInfoModalVisible, setIsShowProjectLaunchInfoModalVisible] =
    useState(false);
  const [isCreateMilestoneModalVisible, setIsCreateMilestoneModalVisible] = useState(false);
  const { authenticatedUser } = useAuth();
  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (id) dispatch(fetchProject(id, { onError: () => setNotFound(true) }));

    return () => {
      dispatch(setProject(null));
    };
  }, [id]);

  const submitProject = async () => {
    if (project && wallet.publicKey && wallet.signTransaction) {
      const metadataUrl = await getIPFSUrlForProject(project);
      const nftTransaction = await createNftTransaction(
        connection,
        new web3.PublicKey(import.meta.env.VITE_NFT_GENERATOR_PROGRAM_ID),
        wallet.publicKey,
        metadataUrl,
        project.projectLaunchName,
      );
      const transaction = await wallet.signTransaction(nftTransaction);
      const dataAccountHash = await connection.sendRawTransaction(transaction.serialize());

      dispatch(
        updateProject(
          project.id,
          { isFinal: true, dataAccountHash },
          {
            onSuccess: () => {
              setIsSubmitProjectModalVisible(false);
              if (id) dispatch(fetchProject(id));
            },
          },
        ),
      );
    }
  };

  // const deleteProject = () => {
  //   if (id) {
  //     dispatch(
  //       removeProject(id, {
  //         onSuccess: () => navigate(AppRoutes.Projects),
  //       }),
  //     );
  //   }
  // };

  return notFound ? (
    <NotFoundPage />
  ) : (
    project && (
      <>
        {isSubmitProjectModalVisible &&
          createPortal(
            <Modal
              title='Submit project'
              buttons={[
                {
                  type: 'accept',
                  name: 'Submit',
                  action: () => submitProject(),
                },
                {
                  type: 'close',
                  name: 'Cancel',
                  action: () => setIsSubmitProjectModalVisible(false),
                },
              ]}
              className='max-w-[596px]'
            >
              Are you sure you want to submit this submit? You will not be able to cancel this
              operation.
            </Modal>,
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
              projectLaunch={project.projectLaunch}
              setIsCreateProjectLaunchInvestmentModalVisible={() => {}}
            />,
            document.getElementById('root')!,
          )}
        {/* {isRemoveProjectModalVisible &&
          createPortal(
            <Modal
              title='Delete project'
              buttons={[
                {
                  variant: 'danger',
                  type: 'accept',
                  name: 'Delete',
                  action: () => deleteProject(),
                },
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
          )} */}
        {/* {isEditProjectModalVisible &&
          createPortal(
            <EditProjectModal
              title='Edit project'
              buttons={[
                {
                  type: 'accept',
                  name: 'Save changes',
                  action: () => {
                    setIsEditProjectModalVisible(false);
                    dispatch(fetchProject(project.id));
                  },
                },
                { type: 'close', name: 'Close', action: () => setIsEditProjectModalVisible(false) },
              ]}
              className='max-w-[596px]'
              project={project}
            />,
            document.getElementById('root')!,
          )} */}
        {isCreateMilestoneModalVisible &&
          createPortal(
            <CreateMilestoneModal
              title='Create milestone'
              buttons={[
                {
                  type: 'close',
                  name: 'Close',
                  action: () => setIsCreateMilestoneModalVisible(false),
                },
                {
                  type: 'accept',
                  name: 'Create',
                  action: () => {
                    setIsCreateMilestoneModalVisible(false);
                    dispatch(fetchProject(project.id));
                  },
                },
              ]}
              project={project}
            />,
            document.getElementById('root')!,
          )}
        <div className='flex flex-col items-center justify-center p-6'>
          <div className='shadow-[0_0_30px_-15px_silver] w-full max-w-[1440px] p-5 rounded-xl bg-white'>
            <div className='flex justify-between items-center'>
              <h3 className='font-bold text-xl font-["Noto"]'>Project details</h3>
              <div className='flex items-center'>
                {authenticatedUser?.id === project.projectLaunch.author.id &&
                  authenticatedUser.role.includes(UserRoleEnum.Startup) && (
                    <>
                      {!project.isFinal &&
                        authenticatedUser.id === project.projectLaunch.author.id && (
                          <>
                            {project.milestones.filter(milestone => milestone.isFinal).length ===
                            project.milestoneNumber ? (
                              <Button
                                className='me-2 text-sm bg-emerald-500 hover:bg-emerald-600 inline-flex border-transparent border-2 text-white px-5 py-1 transition-[0.3s_ease] rounded-full font-medium'
                                onClick={() => setIsSubmitProjectModalVisible(true)}
                              >
                                Submit project
                              </Button>
                            ) : (
                              <Button
                                className='me-2 text-sm bg-emerald-500 inline-flex border-transparent border-2 text-white px-5 py-1 transition-[0.3s_ease] rounded-full font-medium opacity-30'
                                disabled
                                title='Submission of the project is not yet possible, as not all milestones have been submitted'
                              >
                                Submit project
                              </Button>
                            )}
                            {/* <Button
                            className='me-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-1.5 rounded-md transition-[0.3s_ease]'
                            onClick={() => setIsEditProjectModalVisible(true)}
                          >
                            Edit
                          </Button> */}
                            {/* <Button
                            className='text-sm bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-1.5 rounded-md transition-[0.3s_ease]'
                            onClick={() => setIsRemoveProjectModalVisible(true)}
                          >
                            Delete
                          </Button>
                          <div className='h-[1.75rem] mx-4 bg-gray-300 w-[2px] rounded-md'></div> */}
                          </>
                        )}
                    </>
                  )}
                <Button
                  className='inline-flex text-sm me-4 font-medium border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full'
                  onClick={() => setIsShowProjectLaunchInfoModalVisible(true)}
                >
                  Launch info
                </Button>
                <Link
                  to={AppRoutes.Projects}
                  className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full text-sm font-medium'
                >
                  Back
                </Link>
              </div>
            </div>
            <hr className='mt-5' />
            <div className='divide-y divide-gray-50'>
              <div className='flex justify-between items-center py-3 font-["Noto"] font-semibold text-gray-600 text-sm'>
                <h3 className='w-1/2'>Project ID</h3>
                <span className='w-1/2'>{project.id}</span>
              </div>
              <div className='flex justify-between items-center py-3 font-["Noto"] font-semibold text-gray-600 text-sm'>
                <h3 className='w-1/2'>Project name</h3>
                <span className='w-1/2'>{project.projectLaunchName}</span>
              </div>
              <div className='flex justify-between items-start py-3 font-["Noto"] font-semibold text-gray-600 text-sm'>
                <h3 className=' text-gray-600'>Description</h3>
                <span className='w-1/2'>{project.projectLaunchDescription}</span>
              </div>
              <div className='flex justify-between items-start py-3 font-["Noto"] font-semibold text-gray-600 text-sm'>
                <h3 className='w-1/2'>Milestones number</h3>
                <span className='w-1/2'>{project.milestoneNumber}</span>
              </div>
              <div className='flex justify-between items-start py-3 font-medium text-gray-600 text-sm'>
                <h3 className='w-1/2 font-["Noto"] font-semibold'>Status</h3>
                <span className='w-1/2'>
                  {project.isFinal ? (
                    <span className='text-xs font-medium text-white rounded-xl bg-emerald-500 px-2 py-0.5'>
                      Submitted
                    </span>
                  ) : (
                    <span className='text-xs font-medium text-white rounded-xl bg-yellow-500 px-2 py-0.5'>
                      In process
                    </span>
                  )}
                </span>
              </div>
              {project.dataAccount?.accountHash && (
                <div className='flex justify-between items-start py-3 font-["Noto"] font-semibold text-gray-600 text-sm'>
                  <h3 className='w-1/2'>Data account hash</h3>
                  <span className='w-1/2 overflow-x-auto with-scrollbar-sm'>
                    {project.dataAccount.accountHash}
                  </span>
                </div>
              )}
              <div className='flex justify-between items-start py-3 pb-0 font-["Noto"] font-semibold text-gray-600 text-sm'>
                <h3 className='w-1/2'>Created at</h3>
                <span className='w-1/2'>{new Date(project.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <MilestonesGrid
            milestones={project.milestones}
            setIsCreateMilestoneModalVisible={setIsCreateMilestoneModalVisible}
            project={project}
            isCreateMilestoneButtonVisible={
              project.milestones.filter(milestone => milestone.isFinal).length !==
                project.milestoneNumber && authenticatedUser?.id === project.projectLaunch.author.id
            }
          />
        </div>
      </>
    )
  );
};

export default DetailsProjectPage;

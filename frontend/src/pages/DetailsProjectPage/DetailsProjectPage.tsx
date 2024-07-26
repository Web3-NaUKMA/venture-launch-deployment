import { FC, useEffect, useState } from 'react';
import { MilestonesGrid } from '../../components/organisms/MilestonesGrid/MilestonesGrid';
import { useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchProject,
  selectProject,
  setProject,
  updateProject,
} from '../../redux/slices/project.slice';
import Button from '../../components/atoms/Button/Button';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import Modal from '../../components/molecules/Modal/Modal';
import { createPortal } from 'react-dom';
import CreateMilestoneModal from '../../components/organisms/CreateMilestoneModal/CreateMilestoneModal';
import { useAuth } from '../../hooks/auth.hooks';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createNftTransaction, getIPFSUrlForProject } from '../../utils/nft.utils';
import * as web3 from '@solana/web3.js';
import ProjectLaunchInfoModal from '../../components/organisms/ProjectLaunchInfoModal/ProjectLaunchInfoModal';
import useWeb3Auth from '../../hooks/web3auth.hooks';
import Spinner from 'components/atoms/Spinner/Spinner';

const DetailsProjectPage: FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectProject);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitProjectModalVisible, setIsSubmitProjectModalVisible] = useState(false);
  const [isShowProjectLaunchInfoModalVisible, setIsShowProjectLaunchInfoModalVisible] =
    useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wasProjectSubmitted, setWasProjectSubmitted] = useState(false);
  const [isCreateMilestoneModalVisible, setIsCreateMilestoneModalVisible] = useState(false);
  const { authenticatedUser } = useAuth();
  const wallet = useWallet();
  const { connection } = useConnection();
  const { connectWallet } = useWeb3Auth();

  useEffect(() => {
    if (id) {
      dispatch(
        fetchProject(id, {
          onError: () => {
            setNotFound(true);
            setIsLoaded(true);
          },
          onSuccess: () => setIsLoaded(true),
        }),
      );
    }

    return () => {
      dispatch(setProject(null));
    };
  }, [id]);

  const submitProject = async () => {
    setWasProjectSubmitted(true);

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
              setWasProjectSubmitted(false);
              setIsSubmitProjectModalVisible(false);
              if (id) dispatch(fetchProject(id));
            },
            onError: () => {
              setWasProjectSubmitted(false);
            },
          },
        ),
      );
    } else if (!wallet.publicKey || !wallet.signTransaction) {
      setWasProjectSubmitted(false);
      connectWallet();
    }
  };

  return notFound ? (
    <NotFoundPage />
  ) : isLoaded ? (
    project && (
      <>
        {isSubmitProjectModalVisible &&
          createPortal(
            <Modal
              title='Submit project'
              onClose={() => setIsSubmitProjectModalVisible(false)}
              className='max-w-[596px]'
            >
              {!wasProjectSubmitted ? (
                <div className='px-10 py-8 flex flex-col'>
                  <p className='font-mono'>
                    Are you sure you want to submit this submit? You will not be able to cancel this
                    operation.
                  </p>
                  <div className='mt-8 flex gap-4'>
                    <button
                      type='button'
                      className='inline-flex text-center justify-center items-center border-2 bg-emerald-500 hover:bg-emerald-600 border-transparent text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                      onClick={() => submitProject()}
                    >
                      Submit
                    </button>
                    <button
                      type='button'
                      className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                      onClick={() => setIsSubmitProjectModalVisible(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className='px-10 py-8 flex flex-col items-center justify-center min-h-[250px] gap-5'>
                  <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
                  <p className='text-center font-mono'>
                    We are proceeding your project submission. Please, complete all required steps
                    and wait for some time
                  </p>
                </div>
              )}
            </Modal>,
            document.getElementById('root')!,
          )}
        {isShowProjectLaunchInfoModalVisible &&
          createPortal(
            <ProjectLaunchInfoModal
              title='Project launch info'
              onClose={() => setIsShowProjectLaunchInfoModalVisible(false)}
              projectLaunch={project.projectLaunch}
              setIsCreateProjectLaunchInvestmentModalVisible={() => {}}
            />,
            document.getElementById('root')!,
          )}
        {isCreateMilestoneModalVisible &&
          createPortal(
            <CreateMilestoneModal
              title='Create milestone'
              onClose={() => setIsCreateMilestoneModalVisible(false)}
              onProcess={() => {
                setIsCreateMilestoneModalVisible(false);
                dispatch(fetchProject(project.id));
              }}
              project={project}
            />,
            document.getElementById('root')!,
          )}
        <div className='flex flex-col items-center justify-center px-6 py-10'>
          <div className='shadow-[0_0_15px_-7px_gray] w-full max-w-[1440px] rounded-xl bg-white'>
            <div className='flex justify-between items-center px-10 py-8'>
              <h3 className='font-serif text-2xl'>Project details</h3>
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
                                className='me-2 bg-emerald-500 hover:bg-emerald-600 inline-flex border-transparent border-2 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium'
                                onClick={() => setIsSubmitProjectModalVisible(true)}
                              >
                                Submit project
                              </Button>
                            ) : (
                              <Button
                                className='me-2 bg-emerald-500 inline-flex border-transparent border-2 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium opacity-30'
                                disabled
                                title='Submission of the project is not yet possible, as not all milestones have been submitted'
                              >
                                Submit project
                              </Button>
                            )}
                          </>
                        )}
                    </>
                  )}
                <Button
                  className='inline-flex me-4 font-medium border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 font-sans rounded-full'
                  onClick={() => setIsShowProjectLaunchInfoModalVisible(true)}
                >
                  Launch info
                </Button>
                <Link
                  to={AppRoutes.Home}
                  className='inline-flex border-transparent bg-stone-400 hover:bg-transparent border-2 hover:border-stone-600 hover:text-stone-600 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium'
                >
                  Back
                </Link>
              </div>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Project ID</h3>
              <span className='font-mono'>{project.id}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Project name</h3>
              <span className='font-mono'>{project.projectLaunchName}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Description</h3>
              <span className='font-mono whitespace-pre-wrap'>
                {project.projectLaunchDescription}
              </span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Milestones number</h3>
              <span className='font-mono'>{project.milestoneNumber}</span>
            </div>
            <hr />
            {project.projectLaunch?.dao && (
              <>
                <div className='px-10 py-5'>
                  <h3 className='font-sans font-semibold text-xl mb-1.5'>
                    Link to the DAO in Solana Explorer
                  </h3>
                  <a
                    href={`https://explorer.solana.com/address/${project.projectLaunch.dao.multisigPda}/anchor-account?cluster=devnet`}
                    className='font-mono text-blue-500 hover:underline transition-all duration-300'
                    target='_blank'
                  >{`https://explorer.solana.com/address/${project.projectLaunch.dao.multisigPda}/anchor-account?cluster=devnet`}</a>
                </div>
                <hr />
              </>
            )}
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Status</h3>
              <span className='font-sans inline-flex'>
                {project.isFinal ? (
                  <span className='font-medium text-white rounded-full bg-emerald-500 px-5 py-1.5'>
                    Submitted
                  </span>
                ) : (
                  <span className='font-medium text-white rounded-full bg-yellow-500 px-5 py-1.5'>
                    In process
                  </span>
                )}
              </span>
            </div>
            <hr />
            {project.dataAccount?.accountHash && (
              <>
                <div className='px-10 py-5'>
                  <h3 className='font-sans font-semibold text-xl mb-1.5'>Data account hash</h3>
                  <span className='font-mono'>{project.dataAccount.accountHash}</span>
                </div>
                <hr />
              </>
            )}
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Created at</h3>
              <span className='font-mono'>{new Date(project.createdAt).toLocaleString()}</span>
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
  ) : (
    <div className='max-w-[1440px] flex flex-col items-center justify-center flex-1 gap-5 w-full'>
      <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
      <p className='text-center font-mono'>Loading the project details page for you</p>
    </div>
  );
};

export default DetailsProjectPage;

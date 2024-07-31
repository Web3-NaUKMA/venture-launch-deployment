import { FC, useState } from 'react';
import { Milestone as MilestoneType } from '../../../types/milestone.types';
import Button from '../../atoms/Button/Button';
import { EditIcon, RemoveIcon } from '../../atoms/Icons/Icons';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import { createPortal } from 'react-dom';
import Modal from '../Modal/Modal';
import EditMilestoneModal from '../../organisms/EditMilestoneModal/EditMilestoneModal';
import { removeMilestone, updateMilestone } from '../../../redux/slices/milestone.slice';
import { fetchProject } from '../../../redux/slices/project.slice';
import { useParams } from 'react-router';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { USDC_MINT, createWithdrawTx, programId } from '../../../utils/venture-launch.utils';
import { ProjectLaunch } from '../../../types/project-launch.types';
import { useAuth } from '../../../hooks/auth.hooks';
import { UserRoleEnum } from '../../../types/enums/user-role.enum';
import useWeb3Auth from '../../../hooks/web3auth.hooks';
import ApproveMilestoneModal from 'components/organisms/ApproveMilestoneModal/ApproveMilestoneModal';
import Proposal from '../Proposal/Proposal';
import { ProposalVoteEnum } from 'types/enums/proposal-vote.enum';
import { ProposalStatusEnum } from 'types/enums/proposal-status.enum';
import axios, { HttpStatusCode } from 'axios';
import { CommandType } from 'utils/dao.utils';
import Image from 'components/atoms/Image/Image';
import { resolveImage } from 'utils/file.utils';

export interface MilestoneProps {
  milestone: MilestoneType;
  projectLaunch?: ProjectLaunch;
}

const Milestone: FC<MilestoneProps> = ({ milestone, projectLaunch }) => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const dispatch = useAppDispatch();
  const { authenticatedUser } = useAuth();
  const { id } = useParams();
  const [isRemoveMilestoneModalVisible, setIsRemoveMilestoneModalVisible] = useState(false);
  const [isWithdrawMilestoneModalVisible, setIsWithdrawMilestoneModalVisible] = useState(false);
  const [isApproveMilestoneModalVisible, setIsApproveMilestoneModalVisible] = useState(false);
  const [isEditMilestoneModalVisible, setIsEditMilestoneModalVisible] = useState(false);
  const { connectWallet } = useWeb3Auth();

  const withdrawMilestone = async () => {
    if (publicKey && signTransaction) {
      const associatedTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      let tx = await createWithdrawTx(
        connection,
        programId,
        publicKey,
        associatedTokenAccount,
        new PublicKey(projectLaunch!.vaultTokenAccount),
        new PublicKey(projectLaunch!.cryptoTrackerAccount),
        projectLaunch!.fundraiseProgress / projectLaunch!.project!.milestoneNumber,
      );

      tx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(tx.serialize());
      console.log(signature);

      dispatch(
        updateMilestone(
          milestone.id,
          { isWithdrawn: true },
          {
            onSuccess: () => {
              setIsWithdrawMilestoneModalVisible(false);
              if (id) dispatch(fetchProject(id));
            },
          },
        ),
      );
    } else {
      connectWallet();
    }
  };

  const deleteMilestone = () => {
    dispatch(
      removeMilestone(milestone.id, {
        onSuccess: () => {
          setIsRemoveMilestoneModalVisible(false);
          if (id) dispatch(fetchProject(id));
        },
      }),
    );
  };

  return (
    <>
      {isRemoveMilestoneModalVisible &&
        createPortal(
          <Modal
            title='Delete milestone'
            onClose={() => setIsRemoveMilestoneModalVisible(false)}
            className='max-w-[596px]'
          >
            <div className='px-10 py-8 flex flex-col'>
              <p className='font-mono'>
                Are you sure you want to delete this milestone? You will not be able to restore the
                milestone after performing this operation.
              </p>
              <div className='mt-8 flex gap-4'>
                <button
                  type='button'
                  className='inline-flex text-center justify-center items-center bg-red-500 hover:bg-red-400 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                  onClick={() => deleteMilestone()}
                >
                  Delete
                </button>
                <button
                  type='button'
                  className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                  onClick={() => setIsRemoveMilestoneModalVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>,
          document.getElementById('root')!,
        )}
      {isWithdrawMilestoneModalVisible &&
        createPortal(
          <Modal
            title='Withdraw milestone'
            onClose={() => setIsWithdrawMilestoneModalVisible(false)}
            className='max-w-[596px]'
          >
            <div className='px-10 py-8 flex flex-col'>
              <p className='font-mono'>
                Are you sure you want to withdraw money from this milestone?
              </p>
              <div className='mt-8 flex gap-4'>
                <button
                  type='button'
                  className='inline-flex text-center justify-center items-center border-2 border-transparent bg-zinc-900 hover:bg-transparent hover:border-zinc-900 hover:text-zinc-900 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                  onClick={() => withdrawMilestone()}
                >
                  Withdraw
                </button>
                <button
                  type='button'
                  className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                  onClick={() => setIsWithdrawMilestoneModalVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>,
          document.getElementById('root')!,
        )}
      {isApproveMilestoneModalVisible &&
        createPortal(
          <ApproveMilestoneModal
            milestone={milestone}
            title='Approve milestone'
            onClose={() => setIsApproveMilestoneModalVisible(false)}
            onProcess={() => {
              setIsApproveMilestoneModalVisible(false);
              if (id) dispatch(fetchProject(id));
            }}
          />,
          document.getElementById('root')!,
        )}
      {isEditMilestoneModalVisible &&
        createPortal(
          <EditMilestoneModal
            title='Edit milestone'
            onClose={() => setIsEditMilestoneModalVisible(false)}
            onProcess={() => {
              setIsEditMilestoneModalVisible(false);
              if (id) dispatch(fetchProject(id));
            }}
            className='max-w-[596px]'
            milestone={milestone}
          />,
          document.getElementById('root')!,
        )}
      <div className='flex flex-col border rounded-md'>
        <div className='flex p-4 items-start justify-between'>
          <div className='flex flex-col gap-y-1'>
            <div className='flex gap-1'>
              <span className='font-sans font-semibold'>Milestone ID:</span>
              <span className='font-mono'>{milestone.id}</span>
            </div>
            <div className='flex gap-1'>
              <span className='font-sans font-semibold whitespace-nowrap'>
                Merged pull request URL:
              </span>
              <span className='font-mono'>
                <a
                  href={milestone.mergedPullRequestUrl}
                  target='_blank'
                  className='text-blue-600 border-b border-blue-600 hover:border-none transition-[0.3s_ease]'
                >
                  {milestone.mergedPullRequestUrl}
                </a>
              </span>
            </div>
            <div className='flex gap-1'>
              <span className='font-sans font-semibold whitespace-nowrap'>
                Aproval transaction hash:
              </span>
              <span className='font-mono overflow-x-auto with-scrollbar-sm whitespace-nowrap max-w-[600px]'>
                {milestone.transactionApprovalHash ? (
                  <a
                    href={`https://explorer.solana.com/tx/${milestone.transactionApprovalHash}?cluster=devnet`}
                    className='font-mono text-blue-600 transition-all duration-300 underline hover:no-underline'
                    target='_blank'
                  >
                    {`https://explorer.solana.com/tx/${milestone.transactionApprovalHash}?cluster=devnet`}
                  </a>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className='flex gap-1'>
              <span className='font-sans font-semibold'>Status:</span>
              {!milestone.isFinal ? (
                <span className='font-medium text-white rounded-xl bg-yellow-500 px-3'>
                  Under review
                </span>
              ) : milestone.isFinal && !milestone.isWithdrawn ? (
                <span className='font-medium text-white rounded-xl bg-blue-500 px-3'>Approved</span>
              ) : (
                <span className='font-medium text-white rounded-xl bg-emerald-500 px-3'>
                  Withdrawn
                </span>
              )}
            </div>
            <div className='flex gap-1'>
              <span className='font-sans font-semibold'>Created at:</span>
              <span className='font-mono'>{new Date(milestone.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className='flex gap-2'>
            {/* {authenticatedUser?.role.includes(UserRoleEnum.Startup) &&
              authenticatedUser.id === projectLaunch?.author.id &&
              milestone.isFinal &&
              !milestone.isWithdrawn && (
                <Button
                  className='inline-flex border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium'
                  onClick={() => setIsWithdrawMilestoneModalVisible(true)}
                >
                  Withdraw
                </Button>
              )} */}
            {authenticatedUser?.role.includes(UserRoleEnum.BusinessAnalyst) &&
              !milestone.isFinal && (
                <Button
                  className='inline-flex border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium'
                  onClick={() => setIsApproveMilestoneModalVisible(true)}
                >
                  Approve
                </Button>
              )}
            {authenticatedUser?.role.includes(UserRoleEnum.Startup) &&
              authenticatedUser.id === projectLaunch?.author.id &&
              !milestone.isFinal && (
                <>
                  <Button
                    className='inline-flex p-1.5 border rounded-lg hover:bg-neutral-100 transition-[0.3s_ease] text-yellow-600'
                    onClick={() => setIsEditMilestoneModalVisible(true)}
                  >
                    <EditIcon className='size-4' />
                  </Button>
                  <Button
                    className='inline-flex p-1.5 border rounded-lg hover:bg-neutral-100 transition-[0.3s_ease] text-red-600'
                    onClick={() => setIsRemoveMilestoneModalVisible(true)}
                  >
                    <RemoveIcon className='size-4' />
                  </Button>
                </>
              )}
          </div>
        </div>
        {milestone.proposals?.length > 0 && (
          <div className='flex flex-col gap-3 p-5'>
            {structuredClone(milestone.proposals)
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map(proposal => (
                <Proposal
                  key={proposal.id}
                  image={
                    <Image
                      src={resolveImage(projectLaunch?.logo || '')}
                      fallbackSrc='/logo.png'
                      className='w-[48px] aspect-square rounded object-cover'
                    />
                  }
                  className='border rounded-xl'
                  data={{
                    type: proposal.type,
                    status: proposal.status,
                    walletId: projectLaunch?.author.walletId || '',
                    description: proposal.description,
                    projectId: projectLaunch?.project?.id || '',
                    transactionLink: '',
                    createdAt: new Date(proposal.createdAt),
                    executedAt: proposal.executedAt ? new Date(proposal.executedAt) : null,
                    results: {
                      confirmed: proposal.votes.filter(
                        vote => vote.decision === ProposalVoteEnum.Approve,
                      ).length,
                      rejected: proposal.votes.filter(
                        vote => vote.decision === ProposalVoteEnum.Cancel,
                      ).length,
                      threshold: Math.round(
                        (projectLaunch?.dao?.members?.filter(
                          member =>
                            !member.role.find(role => role === UserRoleEnum.BusinessAnalyst),
                        ).length || 0) / 2,
                      ),
                    },
                  }}
                >
                  <div className='flex gap-3 px-5 pt-2'>
                    {projectLaunch?.dao.members?.find(
                      member => member.id === authenticatedUser?.id,
                    ) && proposal.status === ProposalStatusEnum.Voting ? (
                      <>
                        {!authenticatedUser?.role?.find(
                          role => role === UserRoleEnum.BusinessAnalyst,
                        ) &&
                          !proposal.votes.find(vote => vote.memberId === authenticatedUser?.id) && (
                            <>
                              <button
                                type='button'
                                className='inline-flex border-transparent bg-emerald-500 hover:bg-transparent border-2 hover:border-emerald-500 hover:text-emerald-500 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium mb-5'
                                onClick={async () => {
                                  if (authenticatedUser) {
                                    const response = await axios.put(`/proposals/${proposal.id}`, {
                                      votesToAdd: [
                                        {
                                          memberId: authenticatedUser.id,
                                          decision: ProposalVoteEnum.Approve,
                                        },
                                      ],
                                    });

                                    if (response.status === HttpStatusCode.Ok && id) {
                                      dispatch(fetchProject(id));
                                    }
                                  }
                                }}
                              >
                                Vote for
                              </button>
                              <button
                                type='button'
                                className='inline-flex border-transparent bg-red-500 hover:bg-transparent border-2 hover:border-red-500 hover:text-red-500 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium mb-5'
                                onClick={async () => {
                                  if (authenticatedUser) {
                                    const response = await axios.put(`/proposals/${proposal.id}`, {
                                      votesToAdd: [
                                        {
                                          memberId: authenticatedUser.id,
                                          decision: ProposalVoteEnum.Cancel,
                                        },
                                      ],
                                    });

                                    if (response.status === HttpStatusCode.Ok && id) {
                                      dispatch(fetchProject(id));
                                    }
                                  }
                                }}
                              >
                                Vote against
                              </button>
                            </>
                          )}
                      </>
                    ) : (
                      proposal.status === ProposalStatusEnum.PendingExecution &&
                      authenticatedUser?.role?.find(
                        role => role === UserRoleEnum.BusinessAnalyst,
                      ) &&
                      (proposal.votes.filter(vote => vote.decision === ProposalVoteEnum.Approve)
                        .length >=
                      Math.round(
                        (projectLaunch?.dao?.members?.filter(
                          member =>
                            !member.role.find(role => role === UserRoleEnum.BusinessAnalyst),
                        ).length || 0) / 2,
                      ) ? (
                        <button
                          type='button'
                          className='inline-flex border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium mb-5'
                          onClick={async () => {
                            if (authenticatedUser && projectLaunch) {
                              const response = await axios.post(
                                `milestones/${milestone.id}/proposals`,
                                {
                                  createNew: false,
                                  commandType: CommandType.Withdraw,
                                  authorId: authenticatedUser.id,
                                  data: {
                                    multisig_pda: projectLaunch.dao.multisigPda,
                                    is_execute: true,
                                    receiver: projectLaunch.author.walletId,
                                    amount:
                                      Number(
                                        (
                                          (projectLaunch?.projectLaunchInvestments?.reduce(
                                            (previousValue, currentValue) =>
                                              previousValue + Number(currentValue.amount),
                                            0,
                                          ) || 0) / (projectLaunch?.project?.milestoneNumber || 1)
                                        ).toFixed(6),
                                      ) * 1_000_000,
                                  },
                                },
                              );

                              if (response.status === HttpStatusCode.Created && id) {
                                dispatch(fetchProject(id));
                              }
                            }
                          }}
                        >
                          Execute
                        </button>
                      ) : (
                        <button
                          type='button'
                          disabled
                          className='inline-flex border-transparent bg-zinc-900 enabled:hover:bg-transparent border-2 enabled:hover:border-zinc-900 enabled:hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium disabled:opacity-40 mb-5'
                        >
                          Execute
                        </button>
                      ))
                    )}
                  </div>
                </Proposal>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Milestone;

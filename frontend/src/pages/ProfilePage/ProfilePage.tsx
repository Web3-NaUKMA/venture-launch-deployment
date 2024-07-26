import { FC, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import Button from '../../components/atoms/Button/Button';
import { createPortal } from 'react-dom';
import EditUserModal from '../../components/organisms/EditUserModal/EditUserModal';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchAllProjectLaunches,
  selectProjectLaunches,
} from '../../redux/slices/project-launch.slice';
import { UserIcon } from '../../components/atoms/Icons/Icons';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { Project } from '../../components/molecules/Project/Project';
import { resolveImage } from '../../utils/file.utils';
import { Proposal as ProposalType } from 'types/proposal.types';
import axios, { HttpStatusCode } from 'axios';
import qs from 'qs';
import Proposal from 'components/molecules/Proposal/Proposal';
import { ProposalVoteEnum } from 'types/enums/proposal-vote.enum';
import { UserRoleEnum } from 'types/enums/user-role.enum';
import { ProposalStatusEnum } from 'types/enums/proposal-status.enum';
import { CommandType } from 'utils/dao.utils';
import Image from 'components/atoms/Image/Image';
import Spinner from 'components/atoms/Spinner/Spinner';

const ProfilePage: FC = () => {
  const { authenticatedUser, fetchLatestAuthInfo, signOut } = useAuth();
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const [areProposalsLoaded, setAreProposalsLoaded] = useState(false);
  const [areProjectLaunchesLoaded, setAreProjectLaunchesLoaded] = useState(false);
  const projects = useAppSelector(selectProjectLaunches);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (authenticatedUser) {
      dispatch(
        fetchAllProjectLaunches(
          { where: { author: { id: authenticatedUser.id } } },
          {
            onError: () => setAreProjectLaunchesLoaded(true),
            onSuccess: () => setAreProjectLaunchesLoaded(true),
          },
        ),
      );

      const request = async () => {
        const query = qs.stringify(
          {
            relations: {
              milestone: {
                project: {
                  projectLaunch: {
                    dao: true,
                    project: true,
                  },
                },
              },
            },
          },
          {
            arrayFormat: 'comma',
            allowDots: true,
            commaRoundTrip: true,
          } as any,
        );

        const response = await axios.get(`/proposals/${query ? `?${query}` : ``}`);

        if (response.status === HttpStatusCode.Ok) {
          setProposals(
            response.data.filter((proposal: ProposalType) =>
              proposal.milestone.project?.projectLaunch?.dao?.members?.find(
                member => member.id === authenticatedUser?.id,
              ),
            ),
          );
        }

        setAreProposalsLoaded(true);
      };

      request().catch(console.log);
    }
  }, [authenticatedUser]);

  return (
    authenticatedUser &&
    (areProjectLaunchesLoaded && areProposalsLoaded ? (
      <>
        {isEditProfileModalVisible &&
          createPortal(
            <EditUserModal
              title='Edit profile'
              onClose={() => setIsEditProfileModalVisible(false)}
              onProcess={() => {
                setIsEditProfileModalVisible(false);
                fetchLatestAuthInfo();
              }}
              className='max-w-[596px]'
              user={authenticatedUser}
            />,
            document.getElementById('root')!,
          )}
        <div className='flex mt-3 px-6 flex-col justify-start align-center'>
          <h3 className='px-2 text-3xl font-serif mb-10'>User profile</h3>
          <div className='flex flex-col max-w-[1440px] w-full bg-white shadow-[0_0_15px_-7px_gray] rounded-xl'>
            <div className='flex items-center justify-between px-10 py-5'>
              <div className='flex items-center gap-4'>
                {authenticatedUser.avatar ? (
                  <img
                    src={resolveImage(authenticatedUser.avatar)}
                    alt='User profile image'
                    className='w-[64px] rounded-full aspect-square object-cover'
                  />
                ) : (
                  <div className='flex items-center justify-center bg-gray-300 w-[64px] rounded-full aspect-square'>
                    <UserIcon className='size-8' />
                  </div>
                )}
                <span className='font-sans font-semibold text-2xl'>
                  {authenticatedUser.username}
                </span>
              </div>
              <div className='flex gap-4'>
                <Button
                  className='inline-flex text-lg font-sans font-medium border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1 transition-[0.3s_ease] rounded-full'
                  onClick={() => setIsEditProfileModalVisible(true)}
                >
                  Edit
                </Button>
                <Button
                  className='inline-flex text-lg font-sans font-medium border-transparent bg-neutral-400 hover:bg-transparent border-2 hover:border-neutral-400 hover:text-neutral-400 text-white px-10 py-1 transition-[0.3s_ease] rounded-full'
                  onClick={async () => {
                    await signOut();
                    location.replace(AppRoutes.SignIn);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>User ID</h3>
              <span className='font-mono'>{authenticatedUser.id}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Wallet ID</h3>
              <span className='font-mono'>{authenticatedUser.walletId}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Email</h3>
              <span className='font-mono'>{authenticatedUser.email}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>First name</h3>
              {authenticatedUser.firstName?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{authenticatedUser.firstName}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Last name</h3>
              {authenticatedUser.lastName?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{authenticatedUser.lastName}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Role</h3>
              <span className='font-mono'>{authenticatedUser.role.join(', ')}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Bio</h3>
              {authenticatedUser.bio?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{authenticatedUser.bio}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
          </div>
        </div>
        <div className='my-10 px-6'>
          <h4 className='px-2 text-3xl font-serif mb-10'>Proposals</h4>
          {proposals.length > 0 ? (
            <div className='grid gap-5'>
              {structuredClone(proposals)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(proposal => (
                  <Proposal
                    key={proposal.id}
                    image={
                      <Image
                        src={resolveImage(proposal?.milestone?.project?.projectLaunch?.logo || '')}
                        fallbackSrc='/logo.png'
                        className='w-[48px] aspect-square rounded object-cover'
                      />
                    }
                    className='border rounded-xl bg-white shadow-[0_0_15px_-7px_grey]'
                    data={{
                      type: proposal.type,
                      status: proposal.status,
                      walletId: proposal?.milestone?.project?.projectLaunch?.author.walletId || '',
                      description: proposal.description,
                      projectId: proposal?.milestone?.project?.projectLaunch?.project?.id || '',
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
                          (proposal?.milestone?.project?.projectLaunch?.dao?.members?.filter(
                            member =>
                              !member.role.find(role => role === UserRoleEnum.BusinessAnalyst),
                          ).length || 0) / 2,
                        ),
                      },
                    }}
                  >
                    <div className='flex gap-3 px-5 pt-2'>
                      {proposal?.milestone?.project?.projectLaunch?.dao.members?.find(
                        member => member.id === authenticatedUser?.id,
                      ) && proposal.status === ProposalStatusEnum.Voting ? (
                        <>
                          {!authenticatedUser?.role?.find(
                            role => role === UserRoleEnum.BusinessAnalyst,
                          ) &&
                            !proposal.votes.find(
                              vote => vote.memberId === authenticatedUser?.id,
                            ) && (
                              <>
                                <button
                                  type='button'
                                  className='inline-flex border-transparent bg-emerald-500 hover:bg-transparent border-2 hover:border-emerald-500 hover:text-emerald-500 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium mb-5'
                                  onClick={async () => {
                                    if (authenticatedUser) {
                                      const response = await axios.put(
                                        `/proposals/${proposal.id}`,
                                        {
                                          votesToAdd: [
                                            {
                                              memberId: authenticatedUser.id,
                                              decision: ProposalVoteEnum.Approve,
                                            },
                                          ],
                                        },
                                      );

                                      if (response.status === HttpStatusCode.Ok) {
                                        fetchLatestAuthInfo();
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
                                      const response = await axios.put(
                                        `/proposals/${proposal.id}`,
                                        {
                                          votesToAdd: [
                                            {
                                              memberId: authenticatedUser.id,
                                              decision: ProposalVoteEnum.Cancel,
                                            },
                                          ],
                                        },
                                      );

                                      if (response.status === HttpStatusCode.Ok) {
                                        fetchLatestAuthInfo();
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
                          (proposal?.milestone?.project?.projectLaunch?.dao?.members?.filter(
                            member =>
                              !member.role.find(role => role === UserRoleEnum.BusinessAnalyst),
                          ).length || 0) / 2,
                        ) ? (
                          <button
                            type='button'
                            className='inline-flex border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium mb-5'
                            onClick={async () => {
                              if (
                                authenticatedUser &&
                                proposal?.milestone?.project?.projectLaunch
                              ) {
                                const response = await axios.post(
                                  `milestones/${proposal.milestone.id}/proposals`,
                                  {
                                    createNew: false,
                                    commandType: CommandType.Withdraw,
                                    authorId: authenticatedUser.id,
                                    data: {
                                      multisig_pda:
                                        proposal.milestone.project.projectLaunch.dao.multisigPda,
                                      is_execute: true,
                                      receiver:
                                        proposal.milestone.project.projectLaunch.author.walletId,
                                      amount:
                                        (proposal.milestone.project.projectLaunch.projectLaunchInvestments?.reduce(
                                          (previousValue, currentValue) =>
                                            previousValue + Number(currentValue.amount),
                                          0,
                                        ) || 0) /
                                        (proposal.milestone.project.projectLaunch.project
                                          ?.milestoneNumber || 1),
                                    },
                                  },
                                );

                                if (response.status === HttpStatusCode.Created) {
                                  fetchLatestAuthInfo();
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
          ) : (
            <div className='flex flex-col items-center justify-center px-10 py-8 rounded-2xl border-[3px] border-dashed border-stone-300'>
              <p className='font-mono m-0 text-lg text-stone-400'>You have not any proposals yet</p>
            </div>
          )}
        </div>
        <div className='my-10 px-6'>
          <h4 className='px-2 text-3xl font-serif mb-10'>My projects</h4>
          {projects.length > 0 ? (
            <div className='grid lg:grid-cols-2 gap-10 mt-5 auto-rows-fr'>
              {projects.map(project => (
                <Project key={project.id} project={project} variant='short' />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center px-10 py-8 rounded-2xl border-[3px] border-dashed border-stone-300'>
              <p className='font-mono m-0 text-lg text-stone-400'>
                You have not launched any projects yet
              </p>
            </div>
          )}
        </div>
      </>
    ) : (
      <div className='max-w-[1440px] flex flex-col items-center justify-center flex-1 gap-5 w-full'>
        <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
        <p className='text-center font-mono'>Loading your profile page</p>
      </div>
    ))
  );
};

export default ProfilePage;

import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import {
  createProjectLaunch,
  selectErrors,
  setError,
} from '../../../redux/slices/project-launch.slice';
import Button from '../../atoms/Button/Button';
import {
  EmptyLogoIcon,
  FileIcon,
  ImageIcon,
  PlusIcon,
  RemoveIcon,
  UserCircleIcon,
  VideoIcon,
} from '../../atoms/Icons/Icons';
import { UserRoleEnum } from '../../../types/enums/user-role.enum';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { USDC_MINT, createVaultTx, programId } from '../../../utils/venture-launch.utils';
import useWeb3Auth from '../../../hooks/web3auth.hooks';
import Spinner from 'components/atoms/Spinner/Spinner';

export interface LaunchProjectModalProps extends ModalProps {}

interface LaunchProjectModalState {
  data: {
    name?: string;
    description?: string;
    fundraiseAmount?: number;
    fundraiseDeadline?: Date;
    image?: File;
    documents?: File[];
    team: {
      image?: File;
      name?: string;
      linkedInUrl?: string;
      position?: string;
      bio?: string;
    }[];
    businessModel?: string;
    tokenomics?: string;
    roundDetails: {
      ticketSize: {
        from?: number;
        to?: number;
      };
      round?: 'seed' | 'pre-seed' | 'private';
      dealStructure?: 'SAFT' | 'SAFE';
      tokenPrice?: number;
      valuation?: number;
      unlockAtTGE?: number;
      lockup?: number;
      vesting?: number;
    };
    milestoneNumber?: number;
  };
  error: string | null;
  isLoading: boolean;
}

const initialState: LaunchProjectModalState = {
  data: {
    name: undefined,
    description: undefined,
    fundraiseAmount: undefined,
    fundraiseDeadline: undefined,
    image: undefined,
    team: [],
    businessModel: undefined,
    tokenomics: undefined,
    roundDetails: {
      ticketSize: {
        from: undefined,
        to: undefined,
      },
      round: 'seed',
      dealStructure: 'SAFT',
      tokenPrice: undefined,
      valuation: undefined,
      unlockAtTGE: undefined,
      lockup: undefined,
      vesting: undefined,
    },
  },
  error: null,
  isLoading: false,
};

const LaunchProjectModal: FC<LaunchProjectModalProps> = ({ title, onClose, children }) => {
  const { authenticatedUser } = useAuth();
  const [state, setState] = useState(initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { connectWallet } = useWeb3Auth();

  useEffect(() => {
    dispatch(setError({ createProjectLaunch: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.createProjectLaunch });
  }, [errors.createProjectLaunch]);

  const isDataValid = (data: LaunchProjectModalState['data']): boolean => {
    if (!data.name?.trim()) {
      setState({ ...state, error: 'Project launch name cannot be empty.' });
      return false;
    }

    if (!data.description?.trim()) {
      setState({ ...state, error: 'Project launch description cannot be empty.' });
      return false;
    }

    if ((data.milestoneNumber ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch number of milestones must be greater than 0.' });
      return false;
    }

    if ((data.fundraiseAmount ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch fundraiseAmount must be greater than 0.' });
      return false;
    }

    if (new Date(data.fundraiseDeadline ?? 0).getTime() <= Date.now()) {
      setState({
        ...state,
        error: 'Project launch fundraise deadline cannot be earlier than current time.',
      });
      return false;
    }

    if (!data.businessModel?.trim()) {
      setState({ ...state, error: 'Project launch business model cannot be empty.' });
      return false;
    }

    if (!data.tokenomics?.trim()) {
      setState({ ...state, error: 'Project launch tokenomics cannot be empty.' });
      return false;
    }

    if ((data.roundDetails.ticketSize.from ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch ticket size min value must be greater than 0.' });
      return false;
    }

    if ((data.roundDetails.ticketSize.to ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch ticket size max value must be greater than 0.' });
      return false;
    }

    if ((data.roundDetails.ticketSize.from ?? 0) >= (data.roundDetails.ticketSize.to ?? 0)) {
      setState({
        ...state,
        error: 'Project launch ticket size min value must be less than max value.',
      });
      return false;
    }

    if (data.roundDetails.tokenPrice && data.roundDetails.tokenPrice <= 0) {
      setState({ ...state, error: 'Project launch token price must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.valuation && data.roundDetails.valuation <= 0) {
      setState({ ...state, error: 'Project launch valuation must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.unlockAtTGE && data.roundDetails.unlockAtTGE <= 0) {
      setState({ ...state, error: 'Project launch unlock at TGE must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.lockup && data.roundDetails.lockup <= 0) {
      setState({ ...state, error: 'Project launch lockup must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.vesting && data.roundDetails.vesting <= 0) {
      setState({ ...state, error: 'Project launch vesting must be greater than 0.' });
      return false;
    }

    if (
      data.team &&
      data.team.find(
        member =>
          !member.name?.trim() ||
          !member.linkedInUrl?.trim() ||
          !member.bio?.trim() ||
          !member.position?.trim(),
      )
    ) {
      setState({ ...state, error: 'One of the team members has incomplete information.' });
      return false;
    }

    return true;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setState({ ...state, isLoading: true });

    const dataIsValid = isDataValid(state.data);

    if (!dataIsValid && formRef.current?.parentElement) {
      formRef.current.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (formRef.current && dataIsValid && authenticatedUser) {
      const formData = new FormData(formRef.current);
      formData.delete('project-documents');

      state.data.documents?.forEach(document => {
        formData.append('project-documents', document);
      });

      Object.entries({
        ...state.data,
        team: state.data.team?.map(member => ({ ...member, image: member.image?.name || '' })),
      }).forEach(([key, value]) => {
        if (value && !(value instanceof File)) {
          if (value instanceof Date) {
            formData.set(key, new Date(value).toISOString());
          } else if (value === Object(value)) {
            formData.set(key, JSON.stringify(value));
          } else {
            formData.set(key, value.toString());
          }
        }
      });

      if (authenticatedUser && publicKey && signTransaction) {
        formData.append('authorId', authenticatedUser.id);
        let [tx, vaultTokenAccount, cryptoTrackerAccount] = await createVaultTx(
          connection,
          programId,
          publicKey,
          USDC_MINT,
        );

        try {
          tx = await signTransaction(tx);
          await connection.sendRawTransaction(tx.serialize());

          formData.set('vaultTokenAccount', vaultTokenAccount.toBase58());
          formData.set('cryptoTrackerAccount', cryptoTrackerAccount.toBase58());

          dispatch(
            createProjectLaunch(
              formData,
              {
                onSuccess: () => {
                  setState({ ...state, isLoading: false });
                  onClose?.();
                },
                onError: () =>
                  setState({
                    ...state,
                    isLoading: false,
                    error:
                      'Cannot create project launch. The launch with such name already exists for this user or the invalid data was provided',
                  }),
              },
              authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst),
            ),
          );
        } catch (error: any) {
          setState({ ...state, isLoading: false, error: error.toString() });
        }
      } else {
        setState({ ...state, isLoading: false });
        connectWallet();
      }
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[768px]'>
      {!state.isLoading ? (
        <>
          <form ref={formRef} className='flex flex-col' onSubmit={onSubmit}>
            <div className='flex flex-col mx-10 mt-8 mb-14'>
              {state.error && (
                <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-5'>
                  {state.error}
                </span>
              )}
              <h3 className='text-2xl mb-5 text-zinc-900 sm:col-span-2 font-sans font-semibold'>
                General info
              </h3>
              <div className='grid sm:grid-cols-[180px_1fr] gap-8 mb-5 sm:mb-10'>
                <div className='flex flex-col'>
                  <div className='mt-9 mb-10'>
                    {state.data.image ? (
                      <img
                        src={URL.createObjectURL(state.data.image)}
                        alt='Project launch image'
                        className='rounded-xl aspect-square object-cover'
                      />
                    ) : (
                      <div className='bg-neutral-200 flex items-center justify-center aspect-square rounded-lg'>
                        <EmptyLogoIcon className='stroke-2 text-neutral-500' />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor='launch_project_logo'
                    className='cursor-pointer border-2 border-dashed font-sans font-medium rounded-full text-zinc-900 border-zinc-900 inline-flex py-2 text-center justify-center items-center hover:border-solid hover:bg-zinc-900 hover:text-white transition-all duration-300'
                  >
                    Upload logo
                  </label>
                  <input
                    type='file'
                    name='project-logo'
                    id='launch_project_logo'
                    className='border p-2 rounded-md mb-5 hidden font-sans'
                    accept='image/*'
                    onChange={event =>
                      setState({
                        ...state,
                        data: { ...state.data, image: event.target.files?.[0] },
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_name'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Name
                  </label>
                  <input
                    type='text'
                    id='launch_project_name'
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 mb-5 sm:mb-3'
                    placeholder='New project'
                    defaultValue={state.data.name}
                    onChange={event =>
                      setState({
                        ...state,
                        data: { ...state.data, name: event.target.value },
                        error: null,
                      })
                    }
                  />
                  <label
                    htmlFor='launch_project_description'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Description
                  </label>
                  <textarea
                    id='launch_project_description'
                    className='border border-stone-400 resize-none p-3 rounded-lg whitespace-pre-wrap text-stone-800 placeholder:text-stone-400 min-h-[170px] font-sans'
                    defaultValue={state.data.description}
                    placeholder='Project description'
                    onChange={event =>
                      setState({
                        ...state,
                        data: { ...state.data, description: event.target.value },
                        error: null,
                      })
                    }
                  />
                </div>
              </div>
              <div className='grid sm:grid-cols-2 gap-x-8 gap-y-5'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_milestones_number'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Number of milestones
                  </label>
                  <input
                    type='number'
                    id='launch_project_milestones_number'
                    className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-sans'
                    defaultValue={state.data.milestoneNumber}
                    min={0}
                    placeholder='10'
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          milestoneNumber: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_fundraise_amount'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Fundraise amount (in USD)
                  </label>
                  <input
                    type='number'
                    id='launch_project_fundraise_amount'
                    className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-sans'
                    defaultValue={state.data.fundraiseAmount}
                    min={0}
                    placeholder='100000'
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          fundraiseAmount: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col sm:col-span-2'>
                  <label
                    htmlFor='launch_project_fundraise_deadline'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Fundraise deadline
                  </label>
                  <input
                    type='datetime-local'
                    id='launch_project_fundraise_deadline'
                    className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-dark font-sans font-medium'
                    defaultValue={
                      state.data.fundraiseDeadline
                        ? state.data.fundraiseDeadline.toISOString().slice(0, 19)
                        : undefined
                    }
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          fundraiseDeadline: event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        },
                        error: null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <hr />
            <div className='flex flex-col mx-10 my-14'>
              <h3 className='text-2xl mb-5 text-zinc-900 sm:col-span-2 font-sans font-semibold'>
                Team
              </h3>
              <div className='flex flex-col items-start'>
                {state.data.team.length > 0 ? (
                  state.data.team.map((member, index) => (
                    <div key={index} className='flex flex-col mb-5 w-full'>
                      <div className='grid grid-cols-[64px_1fr] gap-4 items-center'>
                        <div className='flex flex-col'>
                          {state.data.team[index].image ? (
                            <img
                              src={URL.createObjectURL(state.data.team[index].image!)}
                              alt='Project launch team mebmer image'
                              className='aspect-square rounded-full object-cover'
                            />
                          ) : (
                            <div className='flex items-center justify-center aspect-square rounded-full object-cover bg-neutral-300'>
                              <UserCircleIcon className='stroke-2 size-8 text-neutral-500' />
                            </div>
                          )}
                        </div>
                        <div className='grid sm:grid-cols-2 gap-4 items-center'>
                          <div className='flex flex-col mb-2'>
                            <label
                              htmlFor={`launch_project_team_${index}_name`}
                              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                            >
                              Name:
                            </label>
                            <input
                              type='text'
                              id={`launch_project_team_${index}_name`}
                              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-sans'
                              placeholder='John Doe'
                              defaultValue={member.name}
                              onChange={event =>
                                setState({
                                  ...state,
                                  data: {
                                    ...state.data,
                                    team: state.data.team.map((m, i) =>
                                      i === index
                                        ? {
                                            ...m,
                                            name: event.target.value,
                                          }
                                        : m,
                                    ),
                                  },
                                  error: null,
                                })
                              }
                            />
                          </div>
                          <div className='flex flex-col mb-2'>
                            <label
                              htmlFor={`launch_project_team_${index}_position`}
                              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                            >
                              Position:
                            </label>
                            <input
                              type='text'
                              id={`launch_project_team_${index}_position`}
                              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-sans'
                              placeholder='CEO'
                              defaultValue={member.position}
                              onChange={event =>
                                setState({
                                  ...state,
                                  data: {
                                    ...state.data,
                                    team: state.data.team.map((m, i) =>
                                      i === index
                                        ? {
                                            ...m,
                                            position: event.target.value,
                                          }
                                        : m,
                                    ),
                                  },
                                  error: null,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className='grid'>
                        <div className='flex flex-col'>
                          <label
                            htmlFor={`launch_project_team_${index}_bio`}
                            className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                          >
                            Bio:
                          </label>
                          <textarea
                            id={`launch_project_team_${index}_bio`}
                            className='border border-stone-400 resize-none p-3 rounded-lg whitespace-pre-wrap text-stone-800 placeholder:text-stone-400 min-h-[100px] mb-4 font-sans'
                            defaultValue={member.bio}
                            placeholder='Web developer'
                            onChange={event =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.map((m, i) =>
                                    i === index
                                      ? {
                                          ...m,
                                          bio: event.target.value,
                                        }
                                      : m,
                                  ),
                                },
                                error: null,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-[1fr_52px] sm:grid-cols-[1fr_200px_52px] items-end gap-4'>
                        <div className='flex flex-col col-span-2 sm:col-span-1'>
                          <label
                            htmlFor={`launch_project_team_${index}_linkedIn_url`}
                            className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                          >
                            LinkedIn URL:{' '}
                          </label>
                          <input
                            type='text'
                            id={`launch_project_team_${index}_linkedIn_url`}
                            className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-sans'
                            placeholder='https://www.linkedin.com/in/a958252262616/'
                            defaultValue={member.linkedInUrl}
                            onChange={event =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.map((m, i) =>
                                    i === index
                                      ? {
                                          ...m,
                                          linkedInUrl: event.target.value,
                                        }
                                      : m,
                                  ),
                                },
                                error: null,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`launch_project_team_${index}_image`}
                            className='cursor-pointer text-center justify-center items-center inline-flex border-transparent border-dashed hover:border-zinc-900 bg-zinc-900 text-white hover:bg-transparent border-2 hover:text-zinc-900 px-10 py-3 transition-all duration-300 rounded-full font-medium w-full'
                          >
                            Upload photo
                          </label>
                          <input
                            type='file'
                            name='team-images'
                            id={`launch_project_team_${index}_image`}
                            className='hidden'
                            accept='image/*'
                            onChange={event =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.map((m, i) =>
                                    i === index ? { ...m, image: event?.target.files?.[0] } : m,
                                  ),
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Button
                            className='p-3 text-white rounded-full bg-red-500 hover:bg-red-400 aspect-square transition-all duration-300'
                            type='button'
                            onClick={() =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.filter(m => m !== member),
                                },
                              })
                            }
                          >
                            <RemoveIcon className='size-7' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className='text-stone-500 font-sans'>
                    No team member has been added yet
                  </span>
                )}
                <Button
                  className='rounded-full p-3 text-stone-500 mt-5 border-2 border-stone-600 hover:bg-stone-500 hover:border-stone-500 transition-all duration-300 hover:text-white'
                  type='button'
                  onClick={() =>
                    setState({
                      ...state,
                      data: {
                        ...state.data,
                        team: [
                          ...state.data.team,
                          {
                            name: undefined,
                            linkedInUrl: undefined,
                            position: undefined,
                            bio: undefined,
                          },
                        ],
                      },
                    })
                  }
                >
                  <PlusIcon className='stroke-2 size-7' />
                </Button>
              </div>
            </div>
            <hr />
            <div className='flex flex-col mx-10 my-14'>
              <h3 className='text-2xl mb-5 text-zinc-900 sm:col-span-2 font-sans font-semibold'>
                Documents
              </h3>
              <div className='flex flex-col items-start'>
                {(state.data.documents?.length ?? 0) > 0 ? (
                  state.data.documents?.map((document, index) => (
                    <div
                      key={index}
                      className='flex bg-stone-100 px-2 py-1 rounded-lg items-center w-full mb-2 text-stone-800'
                    >
                      <div className='me-3'>
                        {document.type.startsWith('image') ? (
                          <ImageIcon className='stroke size-6' />
                        ) : document.type.startsWith('video') ? (
                          <VideoIcon className='stroke size-6' />
                        ) : (
                          <FileIcon className='stroke size-6' />
                        )}
                      </div>
                      <span className='rounded-md text-sm w-full font-sans font-medium'>
                        {document.name}
                      </span>
                      <Button
                        type='button'
                        className='p-1 rounded-md text-red-400 hover:text-red-600 transition-all duration-300 ms-2 text-center items-center flex justify-center'
                        onClick={() =>
                          setState({
                            ...state,
                            data: {
                              ...state.data,
                              documents: state.data.documents?.filter((_, i) => index !== i),
                            },
                          })
                        }
                      >
                        <RemoveIcon className='size-5' />
                      </Button>
                    </div>
                  ))
                ) : (
                  <span className='text-stone-500'>No project documents has been added yet</span>
                )}
                <label
                  htmlFor='project_launch_documents'
                  className='cursor-pointer mt-5 inline-flex border-dashed border-zinc-900 hover:bg-zinc-900 hover:text-white hover:bg-transparent hover:border-transparent border-2 text-zinc-900 px-10 py-2 transition-all duration-300 rounded-full font-medium'
                >
                  Upload files
                </label>
                <input
                  type='file'
                  id='project_launch_documents'
                  name='project-documents'
                  multiple
                  className='hidden'
                  onChange={event =>
                    setState({
                      ...state,
                      data: {
                        ...state.data,
                        documents: [
                          ...(state.data.documents || []),
                          ...Array.from(event.target.files || []),
                        ],
                      },
                    })
                  }
                />
              </div>
            </div>
            <hr />
            <div className='flex flex-col mx-10 my-8'>
              <h3 className='text-2xl mb-5 text-zinc-900 sm:col-span-2 font-sans font-semibold'>
                Business model and tokenomics
              </h3>
              <label
                htmlFor='launch_project_tokenomics'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Tokenomics
              </label>
              <textarea
                id='launch_project_tokenomics'
                className='border border-stone-400 p-3 resize-none rounded-lg whitespace-pre-wrap text-stone-800 placeholder:text-stone-400 min-h-[150px] font-sans mb-5'
                defaultValue={state.data.tokenomics}
                placeholder='New project Tokenomics'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, tokenomics: event.target.value },
                    error: null,
                  })
                }
              />
              <label
                htmlFor='launch_project_business_model'
                className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
              >
                Business model
              </label>
              <textarea
                id='launch_project_business_model'
                className='border border-stone-400 p-3 resize-none rounded-lg whitespace-pre-wrap text-stone-800 placeholder:text-stone-400 min-h-[150px] font-sans'
                defaultValue={state.data.businessModel}
                placeholder='New project Business model'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, businessModel: event.target.value },
                    error: null,
                  })
                }
              />
            </div>
            <hr />
            <div className='flex flex-col mx-10 my-8'>
              <h3 className='text-2xl mb-5 text-zinc-900 sm:col-span-2 font-sans font-semibold'>
                Round details
              </h3>
              <div className='grid sm:grid-cols-2 gap-8'>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_ticket_size'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Ticket size
                  </label>
                  <div className='grid grid-cols-[1fr_20px_1fr] gap-1'>
                    <div className='flex'>
                      <input
                        type='number'
                        id='launch_project_round_details_ticket_size_from'
                        className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 w-full'
                        placeholder='From'
                        min={0}
                        defaultValue={state.data.roundDetails.ticketSize.from}
                        onChange={event =>
                          setState({
                            ...state,
                            data: {
                              ...state.data,
                              roundDetails: {
                                ...state.data.roundDetails,
                                ticketSize: {
                                  ...state.data.roundDetails.ticketSize,
                                  from: event.target.value ? Number(event.target.value) : undefined,
                                },
                              },
                            },
                            error: null,
                          })
                        }
                      />
                    </div>
                    <div className='flex justify-center items-center'>-</div>
                    <div className='flex'>
                      <input
                        type='number'
                        id='launch_project_round_details_ticket_size_to'
                        className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 w-full'
                        placeholder='To'
                        min={0}
                        defaultValue={state.data.roundDetails.ticketSize.to}
                        onChange={event =>
                          setState({
                            ...state,
                            data: {
                              ...state.data,
                              roundDetails: {
                                ...state.data.roundDetails,
                                ticketSize: {
                                  ...state.data.roundDetails.ticketSize,
                                  to: event.target.value ? Number(event.target.value) : undefined,
                                },
                              },
                            },
                            error: null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_round'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Round
                  </label>
                  <select
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 font-semibold bg-transparent'
                    value={state.data.roundDetails.round}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            round: event.target.value as 'seed' | 'pre-seed' | 'private',
                          },
                        },
                        error: null,
                      })
                    }
                  >
                    <option value='seed'>Seed</option>
                    <option value='pre-seed'>Pre-seed</option>
                    <option value='private'>Private</option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_deal_structure'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Deal structure
                  </label>
                  <select
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 font-semibold bg-transparent'
                    value={state.data.roundDetails.dealStructure}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            dealStructure: event.target.value as 'SAFT' | 'SAFE',
                          },
                        },
                        error: null,
                      })
                    }
                  >
                    <option value='SAFT'>SAFT</option>
                    <option value='SAFE'>SAFE</option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_token_price'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Token price (in USD)(Optional)
                  </label>
                  <input
                    type='number'
                    id='launch_project_round_details_token_price'
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400'
                    placeholder='0.01'
                    step={0.01}
                    min={0}
                    defaultValue={state.data.roundDetails.tokenPrice}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            tokenPrice: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_valuation'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Valuation (in USD)(Optional)
                  </label>
                  <input
                    type='number'
                    id='launch_project_round_details_valuation'
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400'
                    placeholder='100000'
                    min={0}
                    defaultValue={state.data.roundDetails.valuation}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            valuation: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_token_price'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Unlock at TGE (in %)(Optional)
                  </label>
                  <input
                    type='number'
                    id='launch_project_round_details_unlock_at_tge'
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400'
                    placeholder='5'
                    min={0}
                    defaultValue={state.data.roundDetails.unlockAtTGE}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            unlockAtTGE: event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_lockup'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Lockup (Months)(Optional)
                  </label>
                  <input
                    type='number'
                    id='launch_project_round_details_lockup'
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400'
                    placeholder='1'
                    min={0}
                    step={0.5}
                    defaultValue={state.data.roundDetails.lockup}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            lockup: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <label
                    htmlFor='launch_project_round_details_vesting'
                    className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
                  >
                    Vesting (Months)(Optional)
                  </label>
                  <input
                    type='number'
                    id='launch_project_round_details_vesting'
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400'
                    placeholder='1'
                    min={0}
                    step={0.5}
                    defaultValue={state.data.roundDetails.vesting}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            vesting: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className='mx-10 mb-8'>
              <button
                type='submit'
                className='inline-flex text-center justify-center items-center bg-zinc-900 text-white font-sans font-medium rounded-full py-3 text-xl w-full hover:bg-zinc-700 transition-all duration-300'
              >
                Launch
              </button>
            </div>
          </form>
          {children}
        </>
      ) : (
        <div className='px-10 py-8 flex flex-col items-center justify-center min-h-[300px] gap-5'>
          <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
          <p className='text-center font-mono'>
            We are proceeding the creation of project launch. You may need to perform some
            additional steps and it may take some time to process your request
          </p>
        </div>
      )}
    </Modal>
  );
};

export default LaunchProjectModal;

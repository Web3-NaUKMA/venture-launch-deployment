import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { IModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import {
  createProjectLaunch,
  selectErrors,
  setError,
} from '../../../redux/slices/project-launch.slice';
import Button from '../../atoms/Button/Button';
import { RemoveIcon } from '../../atoms/Icons/Icons';
import { UserRoleEnum } from '../../../types/enums/user-role.enum';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { USDC_MINT, createVaultTx, programId } from '../../../utils/venture-launch.utils';

export interface ILaunchProjectModalProps extends IModalProps {}

interface ILaunchProjectModalState {
  data: {
    name?: string;
    description?: string;
    fundraiseAmount?: number;
    fundraiseDeadline?: Date;
    team: {
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
}

const initialState: ILaunchProjectModalState = {
  data: {
    name: undefined,
    description: undefined,
    fundraiseAmount: undefined,
    fundraiseDeadline: undefined,
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
};

const LaunchProjectModal: FC<ILaunchProjectModalProps> = ({ title, buttons, children }) => {
  const { authenticatedUser } = useAuth();
  const [state, setState] = useState(initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);
  const [documents, setDocuments] = useState<number[]>([]);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    dispatch(setError({ createProjectLaunch: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.createProjectLaunch });
  }, [errors.createProjectLaunch]);

  const isDataValid = (data: ILaunchProjectModalState['data']): boolean => {
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

    if (formRef.current && isDataValid(state.data) && authenticatedUser) {
      const formData = new FormData(formRef.current);

      Object.entries(state.data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.set(key, new Date(value).toISOString());
        } else if (value === Object(value)) {
          formData.set(key, JSON.stringify(value));
        } else {
          formData.set(key, value.toString());
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

        tx = await signTransaction(tx);
        const signature = await connection.sendRawTransaction(tx.serialize());
        console.log(signature);

        formData.set('vaultTokenAccount', vaultTokenAccount.toBase58());
        formData.set('cryptoTrackerAccount', cryptoTrackerAccount.toBase58());

        dispatch(
          createProjectLaunch(
            formData,
            {
              onSuccess: () => buttons?.find(button => button.type === 'accept')?.action(),
              onError: () =>
                setState({
                  ...state,
                  error:
                    'Cannot create project launch. The launch with such name already exists for this user or the invalid data was provided',
                }),
            },
            authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst),
          ),
        );
      } else {
        setState({ ...state, error: 'Cannot launch a project. The user is unauthorized.' });
      }
    }
  };

  return (
    <Modal
      title={title}
      buttons={buttons?.map(button =>
        button.type === 'accept'
          ? {
              ...button,
              action: () => {
                if (formRef.current && formRef.current instanceof HTMLFormElement) {
                  formRef.current.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true }),
                  );
                }
              },
            }
          : button,
      )}
      className='max-w-[768px]'
    >
      <form ref={formRef} className='flex flex-col' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-5'>
            {state.error}
          </span>
        )}
        <h3 className='font-bold text-xl mb-3 text-gray-700'>General info</h3>
        <label htmlFor='launch_project_name' className='mb-0.5 font-medium text-sm text-gray-500'>
          Name:
        </label>
        <input
          type='text'
          id='launch_project_name'
          className='border p-2 rounded-md mb-5'
          placeholder='New project'
          defaultValue={state.data.name}
          onChange={event =>
            setState({ ...state, data: { ...state.data, name: event.target.value }, error: null })
          }
        />
        <label
          htmlFor='launch_project_description'
          className='mb-0.5 font-medium text-sm text-gray-500'
        >
          Description:
        </label>
        <textarea
          id='launch_project_description'
          className='border p-2 rounded-md mb-5 min-h-[150px]'
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
        <div className='flex flex-col mb-2'>
          <label
            htmlFor={`launch_project_logo`}
            className='mb-0.5 font-medium text-sm text-gray-500'
          >
            Logo:{' '}
          </label>
          <input
            type='file'
            name='project-logo'
            id={`launch_project_logo`}
            className='border p-2 rounded-md mb-5'
          />
        </div>
        <label
          htmlFor='launch_project_milestones_number'
          className='mb-0.5 font-medium text-sm text-gray-500'
        >
          Number of milestones:
        </label>
        <input
          type='number'
          id='launch_project_milestones_number'
          className='border p-2 rounded-md mb-5'
          defaultValue={state.data.milestoneNumber}
          min={0}
          placeholder='10'
          onChange={event =>
            setState({
              ...state,
              data: {
                ...state.data,
                milestoneNumber: event.target.value ? Number(event.target.value) : undefined,
              },
              error: null,
            })
          }
        />
        <label
          htmlFor='launch_project_fundraise_amount'
          className='mb-0.5 font-medium text-sm text-gray-500'
        >
          Fundraise amount (in USD):
        </label>
        <input
          type='number'
          id='launch_project_fundraise_amount'
          className='border p-2 rounded-md mb-5'
          defaultValue={state.data.fundraiseAmount}
          min={0}
          placeholder='100000'
          onChange={event =>
            setState({
              ...state,
              data: {
                ...state.data,
                fundraiseAmount: event.target.value ? Number(event.target.value) : undefined,
              },
              error: null,
            })
          }
        />
        <label
          htmlFor='launch_project_fundraise_deadline'
          className='mb-0.5 font-medium text-sm text-gray-500'
        >
          Fundraise deadline:
        </label>
        <input
          type='datetime-local'
          id='launch_project_fundraise_deadline'
          className='border p-2 rounded-md mb-5'
          defaultValue={
            state.data.fundraiseDeadline
              ? state.data.fundraiseDeadline.toISOString().slice(0, 19)
              : undefined
          }
          min={0}
          placeholder='100000'
          onChange={event =>
            setState({
              ...state,
              data: {
                ...state.data,
                fundraiseDeadline: event.target.value ? new Date(event.target.value) : undefined,
              },
              error: null,
            })
          }
        />
        <h3 className='font-bold text-xl mb-3 text-gray-700'>Team</h3>
        <div className='mb-3 flex flex-col items-start'>
          {state.data.team.length > 0 ? (
            state.data.team.map((member, index) => (
              <div key={index} className='flex flex-col border rounded-md p-2 mb-2 w-full'>
                <div className='flex justify-between items-center mb-3'>
                  <h4 className='font-bold text-gray-500'>Team member #{index + 1}</h4>
                  <Button
                    className='p-1 border rounded-md text-red-600 hover:text-red-500 hover:bg-slate-50 transition-[0.3s_ease]'
                    type='button'
                    onClick={() =>
                      setState({
                        ...state,
                        data: { ...state.data, team: state.data.team.filter(m => m !== member) },
                      })
                    }
                  >
                    <RemoveIcon className='size-4' />
                  </Button>
                </div>
                <div className='flex flex-col mb-2'>
                  <label
                    htmlFor={`launch_project_team_${index}_name`}
                    className='mb-0.5 font-medium text-sm text-gray-500'
                  >
                    Name:{' '}
                  </label>
                  <input
                    type='text'
                    id={`launch_project_team_${index}_name`}
                    className='border px-2 py-1 rounded-md text'
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
                    htmlFor={`launch_project_team_${index}_image`}
                    className='mb-0.5 font-medium text-sm text-gray-500'
                  >
                    Image:{' '}
                  </label>
                  <input
                    type='file'
                    name='team-images'
                    id={`launch_project_team_${index}_image`}
                    className='border px-2 py-1 rounded-md text-sm'
                  />
                </div>
                <div className='flex flex-col mb-2'>
                  <label
                    htmlFor={`launch_project_team_${index}_linkedIn_url`}
                    className='mb-0.5 font-medium text-sm text-gray-500'
                  >
                    LinkedIn URL:{' '}
                  </label>
                  <input
                    type='text'
                    id={`launch_project_team_${index}_linkedIn_url`}
                    className='border px-2 py-1 rounded-md'
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
                <div className='flex flex-col mb-2'>
                  <label
                    htmlFor={`launch_project_team_${index}_position`}
                    className='mb-0.5 font-medium text-sm text-gray-500'
                  >
                    Position:{' '}
                  </label>
                  <input
                    type='text'
                    id={`launch_project_team_${index}_position`}
                    className='border px-2 py-1 rounded-md'
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
                <div className='flex flex-col'>
                  <label
                    htmlFor={`launch_project_team_${index}_bio`}
                    className='mb-0.5 font-medium text-sm text-gray-500'
                  >
                    Bio:{' '}
                  </label>
                  <textarea
                    id={`launch_project_team_${index}_bio`}
                    className='border px-2 py-1 rounded-md h-[100px] resize-none'
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
            ))
          ) : (
            <span className='text-gray-500'>No team member has been added yet</span>
          )}
          <Button
            className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-3 py-0.5 transition-[0.3s_ease] rounded-full text-xs font-medium mt-1'
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
            Add team member
          </Button>
        </div>
        <h3 className='font-bold text-xl mb-3 text-gray-700'>Documents</h3>
        <div className='flex flex-col items-start mb-5'>
          {documents.length > 0 ? (
            documents.map(value => (
              <div key={value} className='flex w-full mb-2'>
                <input
                  type='file'
                  name='project-documents'
                  id={`launch_project_document_${value}`}
                  className='border px-2 py-1 rounded-md text-sm w-full'
                />
                <Button
                  type='button'
                  className='p-1 border rounded-md text-red-600 hover:text-red-500 hover:bg-slate-50 transition-[0.3s_ease] w-[36px] h-[36px] ms-2 text-center items-center flex justify-center'
                  onClick={() => setDocuments(documents.filter(d => d !== value))}
                >
                  <RemoveIcon className='size-4' />
                </Button>
              </div>
            ))
          ) : (
            <span className='text-gray-500'>No project documents has been added yet</span>
          )}
          <Button
            type='button'
            className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-3 py-0.5 transition-[0.3s_ease] rounded-full text-xs font-medium mt-1'
            onClick={() => setDocuments([...documents, documents.length + 1])}
          >
            Add new document
          </Button>
        </div>
        <h3 className='font-bold text-xl mb-3 text-gray-700'>Business modal and tokenomics</h3>
        <label
          htmlFor='launch_project_business_model'
          className='mb-0.5 font-medium text-sm text-gray-500'
        >
          Business model:
        </label>
        <textarea
          id='launch_project_business_model'
          className='border p-2 rounded-md mb-5 min-h-[150px]'
          defaultValue={state.data.businessModel}
          placeholder='New project business model'
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, businessModel: event.target.value },
              error: null,
            })
          }
        />
        <label
          htmlFor='launch_project_tokenomics'
          className='mb-0.5 font-medium text-sm text-gray-500'
        >
          Tokenomics:
        </label>
        <textarea
          id='launch_project_tokenomics'
          className='border p-2 rounded-md mb-5 min-h-[150px]'
          defaultValue={state.data.tokenomics}
          placeholder='New project tokenomics'
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, tokenomics: event.target.value },
              error: null,
            })
          }
        />
        <h3 className='font-bold text-xl mb-3 text-gray-700'>Round details</h3>
        <div className='grid sm:grid-cols-2 gap-3'>
          <div className='flex flex-col'>
            <label
              htmlFor='launch_project_round_details_ticket_size'
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Ticket size:
            </label>
            <div className='grid grid-cols-[1fr_20px_1fr] gap-1'>
              <div className='flex'>
                <input
                  type='number'
                  id='launch_project_round_details_ticket_size_from'
                  className='border p-2 rounded-md w-full'
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
                  className='border p-2 rounded-md w-full'
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
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Round:
            </label>
            <select
              className='border p-2 rounded-md w-full'
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
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Deal structure:
            </label>
            <select
              className='border p-2 rounded-md w-full'
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
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Token price (in USD) (optional):
            </label>
            <input
              type='number'
              id='launch_project_round_details_token_price'
              className='border p-2 rounded-md w-full'
              placeholder='0.01'
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
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Valuation (in USD) (optional):
            </label>
            <input
              type='number'
              id='launch_project_round_details_valuation'
              className='border p-2 rounded-md w-full'
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
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Unlock at TGE (in %) (optional):
            </label>
            <input
              type='number'
              id='launch_project_round_details_unlock_at_tge'
              className='border p-2 rounded-md w-full'
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
                      unlockAtTGE: event.target.value ? Number(event.target.value) : undefined,
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
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Lockup (months) (optional):
            </label>
            <input
              type='number'
              id='launch_project_round_details_lockup'
              className='border p-2 rounded-md w-full'
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
              className='mb-0.5 font-medium text-sm text-gray-500'
            >
              Vesting (months) (optional):
            </label>
            <input
              type='number'
              id='launch_project_round_details_vesting'
              className='border p-2 rounded-md w-full'
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
      </form>
      {children}
    </Modal>
  );
};

export default LaunchProjectModal;

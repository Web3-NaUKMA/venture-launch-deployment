import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { ProjectLaunch } from '../../../types/project-launch.types';
import {
  createProjectLaunchInvestment,
  selectErrors,
  setError,
} from '../../../redux/slices/project-launch.slice';
import { CreateProjectLaunchInvestmentDto } from '../../../types/project-launch-investment.types';
import { useAuth } from '../../../hooks/auth.hooks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { USDC_MINT } from '../../../utils/venture-launch.utils';
import { PublicKey, Transaction } from '@solana/web3.js';
import useWeb3Auth from '../../../hooks/web3auth.hooks';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import Spinner from 'components/atoms/Spinner/Spinner';

export interface CreateInvestmentModalProps extends ModalProps {
  projectLaunch: ProjectLaunch;
}

interface CreateInvestmentModalState {
  data: {
    amount?: number;
  };
  doesUserAgree: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: CreateInvestmentModalState = {
  data: {
    amount: undefined,
  },
  doesUserAgree: false,
  isLoading: false,
  error: null,
};

const CreateInvestmentModal: FC<CreateInvestmentModalProps> = ({
  projectLaunch,
  title,
  onClose,
  onProcess,
  children,
}) => {
  const [state, setState] = useState(initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const { authenticatedUser } = useAuth();
  const errors = useAppSelector(selectErrors);
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { connectWallet } = useWeb3Auth();

  useEffect(() => {
    dispatch(setError({ createProjectLaunchInvestment: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.createProjectLaunchInvestment });
  }, [errors.createProjectLaunchInvestment]);

  const isDataValid = (data: CreateInvestmentModalState['data']): boolean => {
    if (!data.amount || data.amount < 0) {
      setState({ ...state, error: 'Project launch investment cannot be empty or less than 0.' });
      return false;
    }

    return true;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setState({ ...state, isLoading: true });

    if (
      isDataValid(state.data) &&
      authenticatedUser &&
      publicKey &&
      sendTransaction &&
      projectLaunch.dao
    ) {
      const associatedTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        new PublicKey(projectLaunch.dao.vaultPda),
        true,
      );
      const associatedTokenAccountFrom = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey,
        true,
      );

      let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

      let tx = new Transaction().add(
        createTransferInstruction(
          associatedTokenAccountFrom,
          associatedTokenAccount,
          publicKey,
          state.data.amount! * 1_000_000,
        ),
      );
      tx.feePayer = publicKey;
      tx.recentBlockhash = blockhash;

      try {
        await sendTransaction(tx, connection);
        dispatch(
          createProjectLaunchInvestment(
            {
              ...state.data,
              projectLaunchId: projectLaunch.id,
              investorId: authenticatedUser.id,
            } as CreateProjectLaunchInvestmentDto,
            {
              onSuccess: () => {
                setState({ ...state, isLoading: false });
                onProcess?.();
              },
              onError: () => {
                setState({ ...state, isLoading: false });
              },
            },
          ),
        );
      } catch (error: any) {
        setState({ ...state, isLoading: false, error: error.toString() });
      }
    } else if (!publicKey || !signTransaction) {
      setState({ ...state, isLoading: false });
      connectWallet();
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-xl'>
      {!state.isLoading ? (
        <>
          <form ref={formRef} className='flex flex-col py-8 px-10 w-full' onSubmit={onSubmit}>
            {state.error && (
              <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-8 font-mono text-sm'>
                {state.error}
              </span>
            )}
            <div className='flex flex-col'>
              <input
                type='number'
                id='create_project_launch_investment_amount'
                className='border border-stone-400 p-3 rounded-lg text-stone-800 text-center placeholder:text-stone-400 placeholder:text-center font-mono'
                placeholder='Amount'
                min={0.01}
                max={1_000_000}
                step={0.01}
                defaultValue={state.data.amount}
                onChange={event =>
                  setState({
                    ...state,
                    data: {
                      ...state.data,
                      amount: event.target.value ? Number(event.target.value) : undefined,
                    },
                    error: null,
                  })
                }
              />
            </div>
            <div className='flex flex-col mt-5'>
              <div className='flex gap-2 items-baseline'>
                <input
                  type='checkbox'
                  id='approve_milestone_checkbox'
                  className='!ring-0'
                  defaultChecked={state.doesUserAgree}
                  onChange={event => setState({ ...state, doesUserAgree: event.target.checked })}
                />
                <label htmlFor='approve_milestone_checkbox' className='cursor-pointer'>
                  I have read all the information provided in the form and agree to the proposed
                  terms and conditions
                </label>
              </div>
            </div>
            <div className='flex flex-col mt-8 gap-4'>
              <button
                type='submit'
                disabled
                className='inline-flex text-center justify-center items-center bg-zinc-900 text-white font-mono rounded-full py-2.5 text-lg w-full enabled:hover:bg-zinc-700 transition-all duration-300 disabled:opacity-30'
              >
                SAFT/SAFE
              </button>
              <button
                type='submit'
                disabled={!state.doesUserAgree}
                className='inline-flex text-center justify-center items-center bg-zinc-900 text-white font-mono rounded-full py-2.5 text-lg w-full enabled:hover:bg-zinc-700 transition-all duration-300 disabled:opacity-30'
              >
                INVEST
              </button>
            </div>
          </form>
          {children}
        </>
      ) : (
        <div className='px-10 py-8 flex flex-col items-center justify-center min-h-[300px] gap-5'>
          <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
          <p className='text-center font-mono'>
            We are proceeding your investment. Please, complete all required steps and wait for some
            time
          </p>
        </div>
      )}
    </Modal>
  );
};

export default CreateInvestmentModal;

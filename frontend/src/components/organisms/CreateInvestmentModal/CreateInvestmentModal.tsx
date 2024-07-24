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
import { Commitment, ConfirmOptions, Connection, PublicKey, Transaction } from '@solana/web3.js';
import useWeb3Auth from '../../../hooks/web3auth.hooks';
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError,
  TokenInvalidOwnerError,
} from '@solana/spl-token';

async function getOrCreateAssociatedTokenAccount(
  publicKey: PublicKey,
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  commitment?: Commitment,
  confirmOptions?: ConfirmOptions,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<Transaction | Account> {
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    programId,
    associatedTokenProgramId,
  );

  // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically.
  let account: Account;
  try {
    account = await getAccount(connection, associatedToken, commitment, programId);
  } catch (error: unknown) {
    // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
    // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
    // TokenInvalidAccountOwnerError in this code path.
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      // As this isn't atomic, it's possible others can create associated accounts meanwhile.
      try {
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedToken,
            owner,
            mint,
            programId,
            associatedTokenProgramId,
          ),
        );
        return transaction;
      } catch (error: unknown) {
        // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
        // instruction error if the associated account exists already.
      }
      // Now this should always succeed
      account = await getAccount(connection, associatedToken, commitment, programId);
    } else {
      throw error;
    }
  }

  if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
  if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

  return account;
}

export interface CreateInvestmentModalProps extends ModalProps {
  projectLaunch: ProjectLaunch;
}

interface CreateInvestmentModalState {
  data: {
    amount?: number;
  };
  error: string | null;
}

const initialState: CreateInvestmentModalState = {
  data: {
    amount: undefined,
  },
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

    if (isDataValid(state.data) && authenticatedUser && publicKey && sendTransaction) {
      console.log(projectLaunch.dao.vaultPda);
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

      console.log(associatedTokenAccount.toBase58());
      console.log(associatedTokenAccountFrom.toBase58());
      let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

      const programId = new PublicKey('B1Lmegd5rBAAZ4nBRN9ePeMcThLdEQ5ec3yfDZZJxnBY');
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

      // let tx = await createDepositTx(
      //   connection,
      //   programId,
      //   publicKey,
      //   associatedTokenAccount,
      //   new PublicKey(projectLaunch.vaultTokenAccount),
      //   new PublicKey(projectLaunch.cryptoTrackerAccount),
      //   state.data.amount!,
      // );

      // tx = await signTransaction(tx);

      const signature = await sendTransaction(tx, connection);
      console.log(signature);
      // setTimeout(() => { }

      //   , 10000);

      dispatch(
        createProjectLaunchInvestment(
          {
            ...state.data,
            projectLaunchId: projectLaunch.id,
            investorId: authenticatedUser.id,
          } as CreateProjectLaunchInvestmentDto,
          {
            onSuccess: () => onProcess?.(),
          },
        ),
      );
    } else if (!publicKey || !signTransaction) {
      connectWallet();
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[492px]'>
      <form ref={formRef} className='flex flex-col py-8 px-10 w-full' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-8 font-mono text-sm'>
            {state.error}
          </span>
        )}
        <input
          type='number'
          id='create_project_launch_investment_amount'
          className='border border-stone-400 p-3 rounded-lg text-stone-800 text-center placeholder:text-stone-400 placeholder:text-center font-mono'
          placeholder='Amount'
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
        <div className='flex flex-col mt-8 gap-4'>
          <button
            type='submit'
            className='inline-flex text-center justify-center items-center bg-zinc-900 text-white font-mono rounded-full py-2.5 text-lg w-full hover:bg-zinc-700 transition-all duration-300'
          >
            SAFT/SAFE
          </button>
          <button
            type='submit'
            className='inline-flex text-center justify-center items-center bg-zinc-900 text-white font-mono rounded-full py-2.5 text-lg w-full hover:bg-zinc-700 transition-all duration-300'
          >
            INVEST
          </button>
        </div>
      </form>
      {children}
    </Modal>
  );
};

export default CreateInvestmentModal;

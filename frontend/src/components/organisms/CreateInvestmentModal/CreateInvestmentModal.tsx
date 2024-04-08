import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { IModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { IProjectLaunch } from '../../../types/project-launch.types';
import {
  createProjectLaunchInvestment,
  selectErrors,
  setError,
} from '../../../redux/slices/project-launch.slice';
import { ICreateProjectLaunchInvestment } from '../../../types/project-launch-investment.types';
import { useAuth } from '../../../hooks/auth.hooks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  USDC_MINT,
  createDepositTx,
  getAssociatedTokenAddress,
  programId,
} from '../../../utils/venture-launch.utils';
import { PublicKey } from '@solana/web3.js';

export interface ICreateInvestmentModalProps extends IModalProps {
  projectLaunch: IProjectLaunch;
}

interface ICreateInvestmentModalState {
  data: {
    amount?: number;
  };
  error: string | null;
}

const initialState: ICreateInvestmentModalState = {
  data: {
    amount: undefined,
  },
  error: null,
};

const CreateInvestmentModal: FC<ICreateInvestmentModalProps> = ({
  projectLaunch,
  title,
  buttons,
  children,
}) => {
  const [state, setState] = useState(initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const { authenticatedUser } = useAuth();
  const errors = useAppSelector(selectErrors);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    dispatch(setError({ createProjectLaunchInvestment: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.createProjectLaunchInvestment });
  }, [errors.createProjectLaunchInvestment]);

  const isDataValid = (data: ICreateInvestmentModalState['data']): boolean => {
    if (!data.amount || data.amount < 0) {
      setState({ ...state, error: 'Project launch investment cannot be empty or less than 0.' });
      return false;
    }

    return true;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data) && authenticatedUser && publicKey && signTransaction) {
      const associatedTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);

      let tx = await createDepositTx(
        connection,
        programId,
        publicKey,
        associatedTokenAccount,
        new PublicKey(projectLaunch.vaultTokenAccount),
        new PublicKey(projectLaunch.cryptoTrackerAccount),
        state.data.amount!,
      );

      tx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(tx.serialize());
      console.log(signature);

      dispatch(
        createProjectLaunchInvestment(
          {
            ...state.data,
            projectLaunchId: projectLaunch.id,
            investorId: authenticatedUser.id,
          } as ICreateProjectLaunchInvestment,
          {
            onSuccess: () => buttons?.find(button => button.type === 'accept')?.action(),
          },
        ),
      );
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
        <label htmlFor='create_project_launch_investment_amount' className='mb-1'>
          Amount (in USD):
        </label>
        <input
          type='number'
          id='create_project_launch_investment_amount'
          className='border p-2 rounded-md mb-5'
          placeholder='100'
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
      </form>
      {children}
    </Modal>
  );
};

export default CreateInvestmentModal;

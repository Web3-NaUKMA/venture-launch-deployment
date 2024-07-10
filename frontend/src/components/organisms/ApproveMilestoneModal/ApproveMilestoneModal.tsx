import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import Modal, { ModalProps } from 'components/molecules/Modal/Modal';
import { useAppDispatch } from 'hooks/redux.hooks';
import useWeb3Auth from 'hooks/web3auth.hooks';
import { FC, useState } from 'react';
import { Milestone } from 'types/milestone.types';
import * as web3 from '@solana/web3.js';
import { updateMilestone } from 'redux/slices/milestone.slice';

export interface ApproveMilestoneModalProps extends ModalProps {
  milestone: Milestone;
}

export interface ApproveMilestoneModalState {
  doesUserAgree: boolean;
}

const initialState: ApproveMilestoneModalState = {
  doesUserAgree: false,
};

const ApproveMilestoneModal: FC<ApproveMilestoneModalProps> = ({
  milestone,
  title,
  onProcess,
  onClose,
  ...props
}) => {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const dispatch = useAppDispatch();
  const milestoneAccount = Keypair.generate();
  const { connectWallet } = useWeb3Auth();
  const [state, setState] = useState(initialState);

  const submitMilestone = async () => {
    const transaction = new Transaction();

    if (publicKey && signTransaction && sendTransaction) {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: milestoneAccount.publicKey,
          lamports: 1_000_000,
        }),
        new web3.TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
          data: Buffer.from(milestone.mergedPullRequestUrl, 'utf-8'),
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        }),
      );

      const transactionHash = await sendTransaction(transaction, connection);

      dispatch(
        updateMilestone(
          milestone.id,
          { isFinal: true, transactionApprovalHash: transactionHash },
          { onSuccess: data => onProcess?.(data) },
        ),
      );
    } else {
      connectWallet();
    }
  };

  return (
    <Modal title={title} onClose={() => onClose?.()} className='max-w-3xl' {...props}>
      <div className='px-10 py-8 flex flex-col'>
        <div className='flex flex-col gap-5'>
          <div className='flex flex-col'>
            <h4 className='font-semibold text-lg'>Merged pull request url:</h4>
            <p className='font-mono'>{milestone.mergedPullRequestUrl}</p>
          </div>
          <div className='flex flex-col'>
            <h4 className='font-semibold text-lg'>Description:</h4>
            <p className='font-mono whitespace-pre-wrap'>{milestone.description}</p>
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
                I have read all the information provided in the form and agree to the proposed terms
                and conditions
              </label>
            </div>
          </div>
        </div>
        <div className='mt-8 flex gap-4'>
          <button
            disabled={!state.doesUserAgree}
            type='button'
            className='disabled:cursor-auto disabled:opacity-50 inline-flex text-center justify-center items-center border-2 border-transparent bg-zinc-900 hover:bg-transparent hover:border-zinc-900 hover:text-zinc-900 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
            onClick={() => submitMilestone()}
          >
            Approve
          </button>
          <button
            type='button'
            className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
            onClick={() => onClose?.()}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveMilestoneModal;

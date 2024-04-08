import { FC, useState } from 'react';
import { IMilestone } from '../../../types/milestone.types';
import Button from '../../atoms/Button/Button';
import { EditIcon, RemoveIcon } from '../../atoms/Icons/Icons';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import { createPortal } from 'react-dom';
import Modal from '../Modal/Modal';
import EditMilestoneModal from '../../organisms/EditMilestoneModal/EditMilestoneModal';
import { removeMilestone, updateMilestone } from '../../../redux/slices/milestone.slice';
import { fetchProject } from '../../../redux/slices/project.slice';
import { useParams } from 'react-router';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { USDC_MINT, createWithdrawTx, programId } from '../../../utils/venture-launch.utils';
import { IProjectLaunch } from '../../../types/project-launch.types';
import { useAuth } from '../../../hooks/auth.hooks';
import { UserRoleEnum } from '../../../types/enums/user-role.enum';

export interface IMilestoneProps {
  milestone: IMilestone;
  projectLaunch?: IProjectLaunch;
}

const Milestone: FC<IMilestoneProps> = ({ milestone, projectLaunch }) => {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const dispatch = useAppDispatch();
  const { authenticatedUser } = useAuth();
  const { id } = useParams();
  const [isRemoveMilestoneModalVisible, setIsRemoveMilestoneModalVisible] = useState(false);
  const [isWithdrawMilestoneModalVisible, setIsWithdrawMilestoneModalVisible] = useState(false);
  const [isApproveMilestoneModalVisible, setIsApproveMilestoneModalVisible] = useState(false);
  const [isEditMilestoneModalVisible, setIsEditMilestoneModalVisible] = useState(false);
  const milestoneAccount = Keypair.generate();

  const transaction = new Transaction();
  if (publicKey) {
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
  }

  const submitMilestone = async () => {
    const transactionHash = await sendTransaction(transaction, connection);
    dispatch(
      updateMilestone(
        milestone.id,
        { isFinal: true, transactionApprovalHash: transactionHash },
        {
          onSuccess: () => {
            setIsApproveMilestoneModalVisible(false);
            if (id) dispatch(fetchProject(id));
          },
        },
      ),
    );
  };

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
            buttons={[
              {
                variant: 'danger',
                type: 'accept',
                name: 'Delete',
                action: () => deleteMilestone(),
              },
              {
                type: 'close',
                name: 'Cancel',
                action: () => setIsRemoveMilestoneModalVisible(false),
              },
            ]}
            className='max-w-[596px]'
          >
            Are you sure you want to delete this milestone? You will not be able to restore the
            milestone after performing this operation.
          </Modal>,
          document.getElementById('root')!,
        )}
      {isWithdrawMilestoneModalVisible &&
        createPortal(
          <Modal
            title='Submit milestone'
            buttons={[
              {
                type: 'accept',
                name: 'Submit',
                action: () => withdrawMilestone(),
              },
              {
                type: 'close',
                name: 'Cancel',
                action: () => setIsWithdrawMilestoneModalVisible(false),
              },
            ]}
            className='max-w-[596px]'
          >
            Are you sure you want to withdraw money from this milestone?
          </Modal>,
          document.getElementById('root')!,
        )}
      {isApproveMilestoneModalVisible &&
        createPortal(
          <Modal
            title='Approve milestone'
            buttons={[
              {
                type: 'accept',
                name: 'Approve',
                action: () => submitMilestone(),
              },
              {
                type: 'close',
                name: 'Cancel',
                action: () => setIsApproveMilestoneModalVisible(false),
              },
            ]}
            className='max-w-[596px]'
          >
            Are you sure you want to approve this milestone?
          </Modal>,
          document.getElementById('root')!,
        )}
      {isEditMilestoneModalVisible &&
        createPortal(
          <EditMilestoneModal
            title='Edit milestone'
            buttons={[
              {
                type: 'accept',
                name: 'Save changes',
                action: () => {
                  setIsEditMilestoneModalVisible(false);
                  if (id) dispatch(fetchProject(id));
                },
              },
              { type: 'close', name: 'Close', action: () => setIsEditMilestoneModalVisible(false) },
            ]}
            className='max-w-[596px]'
            milestone={milestone}
          />,
          document.getElementById('root')!,
        )}
      <div className='flex p-4 border rounded-md items-start justify-between'>
        <div className='flex w-full flex-col text-sm gap-y-1 text-gray-500'>
          <span className='font-["Noto"] font-semibold'>Milestone ID: {milestone.id}</span>
          <span className='font-["Noto"] font-semibold'>
            Merged pull request URL:{' '}
            <a
              href={milestone.mergedPullRequestUrl}
              target='_blank'
              className='text-blue-600 border-b border-blue-600 hover:border-none transition-[0.3s_ease]'
            >
              {milestone.mergedPullRequestUrl}
            </a>
          </span>
          <span className='flex font-["Noto"] font-semibold'>
            <span className='whitespace-nowrap'>Aproval transaction hash: </span>
            <span className='ms-1 overflow-x-auto with-scrollbar-sm'>
              {milestone.transactionApprovalHash ? milestone.transactionApprovalHash : '—'}
            </span>
          </span>
          <span className='flex items-center'>
            <span className='me-2 font-["Noto"] font-semibold'>Status:</span>
            {!milestone.isFinal ? (
              <span className='text-xs font-medium text-white rounded-xl bg-yellow-500 px-1'>
                Under review
              </span>
            ) : milestone.isFinal && !milestone.isWithdrawn ? (
              <span className='text-xs font-medium text-white rounded-xl bg-blue-500 px-1'>
                Approved
              </span>
            ) : (
              <span className='text-xs font-medium text-white rounded-xl bg-emerald-500 px-1'>
                Withdrawn
              </span>
            )}
          </span>
          <span className='font-["Noto"] font-semibold'>
            Created at: {new Date(milestone.createdAt).toLocaleString()}
          </span>
        </div>
        <div className='flex gap-2'>
          {authenticatedUser?.role.includes(UserRoleEnum.Startup) &&
            authenticatedUser.id === projectLaunch?.author.id &&
            milestone.isFinal &&
            !milestone.isWithdrawn && (
              <Button
                className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full text-sm font-medium'
                onClick={() => setIsWithdrawMilestoneModalVisible(true)}
              >
                Withdraw
              </Button>
            )}
          {authenticatedUser?.role.includes(UserRoleEnum.BusinessAnalyst) && !milestone.isFinal && (
            <Button
              className='inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full text-sm font-medium'
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
    </>
  );
};

export default Milestone;

import { FC, HTMLAttributes, ReactNode, useMemo, useState } from 'react';
import TransactionSection from './components/TransactionSection/TransactionSection';
import AccordionButton from 'components/atoms/AccordionButton/AccordionButton';
import TransactionDetails from './components/TransactionDetails/TransactionDetails';

export interface TransactionProps extends HTMLAttributes<HTMLDivElement> {
  image: ReactNode;
  data: {
    type: string;
    walletId: string;
    description: string;
    projectId: string;
    transactionLink: string;
    createdAt: Date;
    executedAt: Date | null;
    results: {
      confirmed: number;
      rejected: number;
    };
  };
}

export interface TransactionState {
  areDetailsVisible: boolean;
}

const initialState: TransactionState = {
  areDetailsVisible: false,
};

const Transaction: FC<TransactionProps> = ({ image, data, ...props }) => {
  const [state, setState] = useState(initialState);
  const datetimeFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'medium' }),
    [],
  );

  return (
    <div className='flex flex-col bg-white rounded-xl shadow-[0_0_15px_-7px_gray]' {...props}>
      <div className='flex p-3 gap-3 items-center w-full'>
        <div className='flex'>{image}</div>
        <div className='grid grid-cols-3 text-sm w-full'>
          <TransactionSection title='Type' value={data.type} />
          <TransactionSection title='Wallet ID' value={data.walletId} />
          <TransactionSection
            title='Datetime'
            value={datetimeFormatter.format(data.createdAt)}
            contentAlign='right'
          />
        </div>
        <div className='flex ms-3'>
          <AccordionButton
            className='bg-stone-200 rounded-xl p-2 text-stone-600 hover:bg-stone-300 transition-all duration-300'
            onClick={() => setState({ ...state, areDetailsVisible: !state.areDetailsVisible })}
          />
        </div>
      </div>
      <TransactionDetails
        isVisible={state.areDetailsVisible}
        data={{
          description: data.description,
          author: data.walletId,
          createdAt: data.createdAt,
          executedAt: data.executedAt,
          projectId: data.projectId,
          transactionLink: data.transactionLink,
          results: data.results,
        }}
      />
    </div>
  );
};

export default Transaction;

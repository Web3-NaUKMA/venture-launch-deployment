import { FC, HTMLAttributes, ReactNode, useMemo, useState } from 'react';
import ProposalSection from './components/ProposalSection/ProposalSection';
import AccordionButton from 'components/atoms/AccordionButton/AccordionButton';
import ProposalDetails from './components/ProposalDetails/ProposalDetails';
import { ProposalStatusEnum } from 'types/enums/proposal-status.enum';

export interface ProposalProps extends HTMLAttributes<HTMLDivElement> {
  image: ReactNode;
  data: {
    type: string;
    walletId: string;
    description: string;
    projectId: string;
    transactionLink: string;
    createdAt: Date;
    executedAt: Date | null;
    status: ProposalStatusEnum;
    results: {
      confirmed: number;
      rejected: number;
      threshold: number;
    };
  };
}

export interface ProposalState {
  areDetailsVisible: boolean;
}

const initialState: ProposalState = {
  areDetailsVisible: false,
};

const Proposal: FC<ProposalProps> = ({ image, data, children, ...props }) => {
  const [state, setState] = useState(initialState);
  const datetimeFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'medium' }),
    [],
  );

  return (
    <div className='flex flex-col bg-white rounded-xl shadow-[0_0_15px_-7px_gray]' {...props}>
      <div className='flex p-3 gap-3 items-center w-full'>
        <div className='flex'>{image}</div>
        <div className='grid grid-cols-4 text-sm w-full'>
          <ProposalSection title='Type' value={data.type} />
          <ProposalSection title='Wallet ID' value={data.walletId} />
          <ProposalSection title='Status' value={data.status} />
          <ProposalSection
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
      <ProposalDetails
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
      >
        {children}
      </ProposalDetails>
    </div>
  );
};

export default Proposal;

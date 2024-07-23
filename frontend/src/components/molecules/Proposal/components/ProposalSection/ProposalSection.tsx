import { FC, HTMLAttributes } from 'react';

export interface ProposalSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  contentAlign?: 'left' | 'right';
}

const ProposalSection: FC<ProposalSectionProps> = ({
  title,
  value,
  contentAlign = 'left',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col ${contentAlign === 'left' ? '' : 'items-end'} overflow-hidden px-5`}
      {...props}
    >
      <span className='font-mono font-semibold overflow-x-auto without-scrollbar'>{value}</span>
      <h6 className='font-sans'>{title}</h6>
    </div>
  );
};

export default ProposalSection;

import { FC, HTMLAttributes } from 'react';

export interface TransactionSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  contentAlign?: 'left' | 'right';
}

const TransactionSection: FC<TransactionSectionProps> = ({
  title,
  value,
  contentAlign = 'left',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col ${contentAlign === 'left' ? '' : 'items-end'} overflow-hidden`}
      {...props}
    >
      <span className='font-mono font-semibold'>{value}</span>
      <h6 className='font-sans'>{title}</h6>
    </div>
  );
};

export default TransactionSection;
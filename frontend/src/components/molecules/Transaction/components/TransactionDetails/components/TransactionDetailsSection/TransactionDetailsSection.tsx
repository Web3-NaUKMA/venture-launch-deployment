import { FC, HTMLAttributes } from 'react';

export interface TransactionDetailsSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

const TransactionDetailsSection: FC<TransactionDetailsSectionProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <div {...props}>
      <h4 className='font-semibold mb-3 text-stone-800'>{title}</h4>
      {children}
    </div>
  );
};

export default TransactionDetailsSection;

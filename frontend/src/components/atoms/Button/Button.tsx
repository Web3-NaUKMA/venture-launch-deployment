import { FC } from 'react';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLElement> {}

const Button: FC<IButtonProps> = props => {
  return <button {...props}>{props.children}</button>;
};

export default Button;

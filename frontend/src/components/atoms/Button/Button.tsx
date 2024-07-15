import { FC } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLElement> {}

const Button: FC<ButtonProps> = ({ ...props }) => {
  return <button {...props}>{props.children}</button>;
};

export default Button;

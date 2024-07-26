import React, { FC } from 'react';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  solid?: boolean;
}

export const CubeIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25'
      />
    </svg>
  );
};

export const IdentificationIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z'
      />
    </svg>
  );
};

export const ExitIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9'
      />
    </svg>
  );
};

export const UserCircleIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
      />
    </svg>
  );
};

export const BurgerMenuIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
      />
    </svg>
  );
};

export const DotsIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z'
      />
    </svg>
  );
};

export const EditIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10'
      />
    </svg>
  );
};

export const RemoveIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
      />
    </svg>
  );
};

export const ReplyIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3'
      />
    </svg>
  );
};

export const EyeIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
      />
      <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
    </svg>
  );
};

export const PinFixedIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M3.24956 22C3.41383 22.0003 3.57654 21.9681 3.72828 21.9052C3.88002 21.8422 4.01778 21.7499 4.13361 21.6334L9.09125 16.6724L9.69784 17.2998C10.5038 18.1459 11.6126 18.6374 12.7807 18.6663C13.1829 18.667 13.5822 18.5991 13.9614 18.4655C14.5505 18.2576 15.068 17.8857 15.4527 17.3935C15.8374 16.9013 16.0734 16.3094 16.1328 15.6875C16.2196 14.8669 16.1595 14.0374 15.9553 13.2379L15.9203 13.0712L18.7433 10.2491L19.1199 10.6266C19.397 10.9177 19.768 11.1017 20.1675 11.1463C20.5669 11.1908 20.9693 11.0929 21.3037 10.8699C21.4996 10.7299 21.6627 10.5491 21.7817 10.3399C21.9007 10.1306 21.9727 9.89803 21.9929 9.65817C22.013 9.41831 21.9807 9.17695 21.8983 8.9508C21.8158 8.72466 21.6852 8.51916 21.5154 8.34855L15.7103 2.53019C15.4332 2.23904 15.0622 2.05501 14.6628 2.0105C14.2633 1.96599 13.8609 2.06387 13.5265 2.28689C13.3306 2.42681 13.1675 2.60765 13.0485 2.81689C12.9296 3.02612 12.8575 3.25873 12.8374 3.49858C12.8172 3.73844 12.8495 3.97981 12.932 4.20595C13.0144 4.43209 13.145 4.63759 13.3148 4.80821L13.7481 5.24565L10.9318 8.06276C10.1144 7.84856 9.26496 7.78447 8.42468 7.87362C7.77616 7.94031 7.16026 8.19118 6.64971 8.59661C6.13917 9.00203 5.75529 9.54508 5.54341 10.1616C5.31487 10.7898 5.27006 11.47 5.41423 12.1227C5.5584 12.7754 5.88559 13.3735 6.35747 13.847L7.35733 14.8768L2.36552 19.867C2.1909 20.0418 2.07202 20.2645 2.02391 20.5068C1.97581 20.7492 2.00063 21.0004 2.09524 21.2287C2.18984 21.457 2.35 21.6521 2.55546 21.7894C2.76091 21.9266 3.00246 21.9999 3.24956 22ZM7.89975 10.9949C7.95518 10.8245 8.05883 10.6738 8.19813 10.5611C8.33744 10.4484 8.50643 10.3785 8.68464 10.3599C9.23072 10.3028 9.78263 10.3451 10.3136 10.4849L11.0043 10.6607C11.2144 10.7142 11.4348 10.7122 11.6438 10.6548C11.8529 10.5974 12.0434 10.4866 12.1967 10.3333L15.5145 7.01373L16.976 8.4802L13.6731 11.7839C13.5262 11.9309 13.4183 12.1121 13.3591 12.3113C13.2999 12.5105 13.2913 12.7212 13.334 12.9246L13.5215 13.8103C13.6596 14.3378 13.7014 14.886 13.6448 15.4284C13.6369 15.5812 13.5829 15.728 13.49 15.8495C13.397 15.971 13.2694 16.0615 13.124 16.1091C12.8249 16.1795 12.5119 16.164 12.2211 16.0646C11.9303 15.9651 11.6735 15.7856 11.4801 15.5467L8.14055 12.093C7.99974 11.9521 7.90223 11.7738 7.85955 11.5792C7.81688 11.3845 7.83083 11.1818 7.89975 10.9949Z'
        fill='currentColor'
      />
    </svg>
  );
};

export const CopyIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z'
      />
    </svg>
  );
};

export const ArchiveIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z'
      />
    </svg>
  );
};

export const PencilIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'
      />
    </svg>
  );
};

export const GoogleIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      width='48'
      height='48'
      viewBox='0 0 48 48'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M23.9996 19.6363V28.9309H36.916C36.3488 31.9199 34.6468 34.4509 32.0941 36.1527L39.8831 42.1964C44.4213 38.0075 47.0395 31.8547 47.0395 24.5456C47.0395 22.8438 46.8868 21.2073 46.6031 19.6366L23.9996 19.6363Z'
        fill='#4285F4'
      />
      <path
        d='M10.5494 28.568L8.79263 29.9128L2.57434 34.7564C6.52342 42.589 14.6174 48 23.9991 48C30.4789 48 35.9116 45.8618 39.8826 42.1964L32.0936 36.1528C29.9554 37.5927 27.2281 38.4656 23.9991 38.4656C17.7591 38.4656 12.4575 34.2547 10.5592 28.5819L10.5494 28.568Z'
        fill='#34A853'
      />
      <path
        d='M2.57436 13.2436C0.938084 16.4726 0 20.1163 0 23.9999C0 27.8834 0.938084 31.5271 2.57436 34.7561C2.57436 34.7777 10.5599 28.5597 10.5599 28.5597C10.08 27.1197 9.79624 25.5925 9.79624 23.9996C9.79624 22.4067 10.08 20.8795 10.5599 19.4395L2.57436 13.2436Z'
        fill='#FBBC05'
      />
      <path
        d='M23.9996 9.55636C27.5342 9.55636 30.676 10.7781 33.1851 13.1345L40.0577 6.2619C35.8904 2.37833 30.4797 0 23.9996 0C14.6179 0 6.52342 5.38908 2.57434 13.2437L10.5597 19.44C12.4578 13.7672 17.7596 9.55636 23.9996 9.55636Z'
        fill='#EA4335'
      />
    </svg>
  );
};

export const EmptyLogoIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      width='71'
      height='64'
      viewBox='0 0 71 64'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M7.1 0H0V63.9H71V0H7.1ZM63.9 7.1V56.8H7.1V7.1H63.9ZM42.6 21.3H35.5V28.4H28.4V35.5H21.3V42.6H14.2V49.7H21.3V42.6H28.4V35.5H35.5V28.4H42.6V35.5H49.7V42.6H56.8V35.5H49.7V28.4H42.6V21.3ZM21.3 14.2H14.2V21.3H21.3V14.2Z'
        fill='currentColor'
      />
    </svg>
  );
};

export const CloseIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      className='w-3 h-3'
      aria-hidden='true'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 14 14'
      {...props}
    >
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
      />
    </svg>
  );
};

export const PlusIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
    </svg>
  );
};

export const LockIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z'
      />
    </svg>
  );
};

export const ImageIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z'
      />
    </svg>
  );
};

export const VideoIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'
      />
    </svg>
  );
};

export const FileIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
      />
    </svg>
  );
};

export const PlanetIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418'
      />
    </svg>
  );
};

export const LinkedInIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      width='48'
      height='48'
      viewBox='0 0 48 48'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g clipPath='url(#clip0_17_32)'>
        <path
          d='M44.4567 0H3.54333C2.60358 0 1.70232 0.373315 1.03782 1.03782C0.373315 1.70232 0 2.60358 0 3.54333V44.4567C0 45.3964 0.373315 46.2977 1.03782 46.9622C1.70232 47.6267 2.60358 48 3.54333 48H44.4567C45.3964 48 46.2977 47.6267 46.9622 46.9622C47.6267 46.2977 48 45.3964 48 44.4567V3.54333C48 2.60358 47.6267 1.70232 46.9622 1.03782C46.2977 0.373315 45.3964 0 44.4567 0ZM14.3067 40.89H7.09V17.9667H14.3067V40.89ZM10.6933 14.79C9.87473 14.7854 9.07583 14.5384 8.39747 14.0802C7.71911 13.622 7.19168 12.9731 6.88175 12.2154C6.57183 11.4577 6.4933 10.6252 6.65606 9.82291C6.81883 9.02063 7.2156 8.28455 7.79631 7.70756C8.37702 7.13057 9.11563 6.73853 9.91893 6.58092C10.7222 6.42331 11.5542 6.50719 12.3099 6.82197C13.0656 7.13675 13.7111 7.66833 14.1649 8.34962C14.6188 9.03092 14.8606 9.83138 14.86 10.65C14.8677 11.1981 14.765 11.7421 14.558 12.2496C14.351 12.7571 14.044 13.2178 13.6551 13.6041C13.2663 13.9905 12.8037 14.2946 12.2948 14.4983C11.786 14.702 11.2413 14.8012 10.6933 14.79ZM40.9067 40.91H33.6933V28.3867C33.6933 24.6933 32.1233 23.5533 30.0967 23.5533C27.9567 23.5533 25.8567 25.1667 25.8567 28.48V40.91H18.64V17.9833H25.58V21.16H25.6733C26.37 19.75 28.81 17.34 32.5333 17.34C36.56 17.34 40.91 19.73 40.91 26.73L40.9067 40.91Z'
          fill='currentColor'
        />
      </g>
      <defs>
        <clipPath id='clip0_17_32'>
          <rect width='48' height='48' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
};

export const PaperClipIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13'
      />
    </svg>
  );
};

export const PaperAirplaneIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5'
      />
    </svg>
  );
};

export const CheckIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M20.0485 6.35147C20.5171 6.8201 20.5171 7.5799 20.0485 8.04853L10.4485 17.6485C9.97988 18.1172 9.22008 18.1172 8.75145 17.6485L3.95145 12.8485C3.48282 12.3799 3.48282 11.6201 3.95145 11.1515C4.42008 10.6828 5.17987 10.6828 5.6485 11.1515L9.59998 15.1029L18.3514 6.35147C18.8201 5.88284 19.5799 5.88284 20.0485 6.35147Z'
        fill='currentColor'
      />
    </svg>
  );
};

export const StarIcon: FC<IconProps> = ({ solid, ...props }) => {
  if (solid) {
    return (
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' {...props}>
        <path
          fillRule='evenodd'
          d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
          clipRule='evenodd'
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
      />
    </svg>
  );
};

export const ShareIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z'
      />
    </svg>
  );
};

export const ChevronDownIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
    </svg>
  );
};

export const ArrowDropDown: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M11.8079 14.7695L8.09346 10.3121C7.65924 9.79109 8.02976 9 8.70803 9L15.292 9C15.9702 9 16.3408 9.79108 15.9065 10.3121L12.1921 14.7695C12.0921 14.8895 11.9079 14.8895 11.8079 14.7695Z'
        fill='currentColor'
      />
    </svg>
  );
};

export const InformationCircleIcon: FC<IconProps> = ({ ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z'
      />
    </svg>
  );
};

export const ChartBarIcon: FC<IconProps> = ({ ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      {...props}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z'
      />
    </svg>
  );
};

export const UserIcon: FC<IconProps> = ({ solid, ...props }) => {
  return (
    <svg
      width='47'
      height='47'
      viewBox='0 0 47 47'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      {...props}
    >
      <rect width='46.8603' height='46.8603' fill='url(#pattern0_600_676)' />
      <defs>
        <pattern id='pattern0_600_676' patternContentUnits='objectBoundingBox' width='1' height='1'>
          <use xlinkHref='#image0_600_676' transform='scale(0.00195312)' />
        </pattern>
        <image
          id='image0_600_676'
          width='512'
          height='512'
          xlinkHref='data:image/png;base64,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'
        />
      </defs>
    </svg>
  );
};

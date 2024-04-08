import { FC } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../types/enums/app-routes.enum';

const NotFoundPage: FC = () => {
  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-800'>404</h1>
        <h2 className='mt-4 text-2xl font-semibold text-gray-800'>Oops! Page not found.</h2>
        <p className='mt-2 text-gray-600'>
          The page you are looking for might have been removed or does not exist.
        </p>
        <Link
          to={AppRoutes.Root}
          className='mt-4 inline-flex border-transparent bg-black hover:bg-transparent border-2 hover:border-black hover:text-black text-white px-5 py-1 transition-[0.3s_ease] rounded-full'
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

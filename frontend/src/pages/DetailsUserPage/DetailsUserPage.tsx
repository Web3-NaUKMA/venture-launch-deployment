import { FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchAllProjectLaunches,
  selectProjectLaunches,
} from '../../redux/slices/project-launch.slice';
import { UserIcon } from '../../components/atoms/Icons/Icons';
import { useNavigate, useParams } from 'react-router';
import { Project } from '../../components/molecules/Project/Project';
import { resolveImage } from '../../utils/file.utils';
import { fetchUser, selectUser, setUser } from '../../redux/slices/user.slice';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { useAuth } from '../../hooks/auth.hooks';
import Spinner from 'components/atoms/Spinner/Spinner';

const DetailsUserPage: FC = () => {
  const [notFound, setNotFound] = useState(false);
  const projects = useAppSelector(selectProjectLaunches);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { authenticatedUser } = useAuth();

  useEffect(() => {
    if (id)
      dispatch(
        fetchUser(
          id,
          {},
          {
            onSuccess: () => {},
            onError: () => {
              setNotFound(true);
            },
          },
        ),
      );

    return () => {
      dispatch(setUser(null));
    };
  }, [id]);

  useEffect(() => {
    if (user) {
      dispatch(
        fetchAllProjectLaunches(
          { where: { author: { id: user.id } } },
          { onError: () => setIsLoaded(true), onSuccess: () => setIsLoaded(true) },
        ),
      );
    }
  }, [user]);

  return notFound ? (
    <NotFoundPage />
  ) : isLoaded ? (
    user && (
      <>
        <div className='flex mt-3 px-6 flex-col justify-start align-center'>
          <h3 className='px-2 text-3xl font-serif mb-10'>User details</h3>
          <div className='flex flex-col max-w-[1440px] w-full bg-white shadow-[0_0_15px_-7px_gray] rounded-xl'>
            <div className='flex items-center justify-between px-10 py-5'>
              <div className='flex items-center gap-4'>
                {user.avatar ? (
                  <img
                    src={resolveImage(user.avatar)}
                    alt='User profile image'
                    className='w-[64px] rounded-full aspect-square object-cover'
                  />
                ) : (
                  <div className='flex items-center justify-center bg-gray-300 w-[64px] rounded-full aspect-square'>
                    <UserIcon className='size-8' />
                  </div>
                )}
                <span className='font-sans font-semibold text-2xl'>{user.username}</span>
              </div>
              <div className='flex gap-2'>
                {user.id !== authenticatedUser?.id && (
                  <button
                    type='button'
                    className='inline-flex text-lg font-sans font-medium border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1 transition-[0.3s_ease] rounded-full'
                    onClick={() =>
                      navigate(AppRoutes.MessageCenter.concat('/new-chat'), {
                        state: {
                          notStartedChat: {
                            user: {
                              id: user.id,
                              username: user.username,
                              firstName: user.firstName,
                              lastName: user.lastName,
                              role: user.role,
                              avatar: user.avatar,
                            },
                          },
                        },
                      })
                    }
                  >
                    Message
                  </button>
                )}
              </div>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>User ID</h3>
              <span className='font-mono'>{user.id}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Email</h3>
              <span className='font-mono'>{user.email}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>First name</h3>
              {user.firstName?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{user.firstName}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Last name</h3>
              {user.lastName?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{user.lastName}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Role</h3>
              <span className='font-mono'>{user.role.join(', ')}</span>
            </div>
            <hr />
            <div className='px-10 py-5'>
              <h3 className='font-sans font-semibold text-xl mb-1.5'>Bio</h3>
              {user.bio?.trim() ? (
                <span className='font-mono whitespace-pre-wrap'>{user.bio}</span>
              ) : (
                <span className='font-mono text-stone-400'>No information available</span>
              )}
            </div>
          </div>
        </div>
        <div className='my-10 px-6'>
          <h4 className='px-2 text-3xl font-serif mb-10'>User projects</h4>
          {projects.length > 0 ? (
            <div className='grid lg:grid-cols-2 gap-10 mt-5 auto-rows-fr'>
              {projects.map(project => (
                <Project key={project.id} project={project} variant='short' />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center px-10 py-8 rounded-2xl border-[3px] border-dashed border-stone-300'>
              <p className='font-mono m-0 text-lg text-stone-400'>
                This user has not launched any projects yet
              </p>
            </div>
          )}
        </div>
      </>
    )
  ) : (
    <div className='max-w-[1440px] flex flex-col items-center justify-center flex-1 gap-5 w-full'>
      <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
      <p className='text-center font-mono'>Loading the user details page for you</p>
    </div>
  );
};

export default DetailsUserPage;

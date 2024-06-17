import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import { ProjectLaunch } from '../../../types/project-launch.types';
import {
  selectErrors,
  setError,
  updateProjectLaunch,
} from '../../../redux/slices/project-launch.slice';

export interface EditProjectModalProps extends ModalProps {
  project: ProjectLaunch;
}

interface EditProjectModalState {
  data: {
    name?: string;
    description?: string;
    authorId?: string;
  };
  error: string | null;
}

const initialState: EditProjectModalState = {
  data: {
    name: undefined,
    description: undefined,
    authorId: undefined,
  },
  error: null,
};

const EditProjectModal: FC<EditProjectModalProps> = ({
  project,
  title,
  onClose,
  onProcess,
  children,
}) => {
  const { authenticatedUser } = useAuth();
  const [state, setState] = useState({
    ...initialState,
    data: {
      ...initialState.data,
      name: project.name,
      description: project.description,
      authorId: authenticatedUser?.id,
    },
  });
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);

  useEffect(() => {
    dispatch(setError({ updateProjectLaunch: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.updateProjectLaunch });
  }, [errors.updateProjectLaunch]);

  useEffect(() => {
    if (authenticatedUser) {
      setState({ ...state, data: { ...state.data, authorId: authenticatedUser.id } });
    }
  }, [authenticatedUser]);

  const isDataValid = (data: EditProjectModalState['data']): boolean => {
    if (!data.name?.trim()) {
      setState({ ...state, error: 'Project name cannot be empty.' });
      return false;
    }

    if (!data.description?.trim()) {
      setState({ ...state, error: 'Project description cannot be empty.' });
      return false;
    }

    return true;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data)) {
      if (authenticatedUser) {
        const formData = new FormData();
        Object.entries(state.data).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value);
          }
        });

        dispatch(
          updateProjectLaunch(project.id, formData, {
            onSuccess: () => onProcess?.(),
          }),
        );
      } else {
        setState({ ...state, error: 'Cannot update a project. The user is unauthorized.' });
      }
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[768px]'>
      <form ref={formRef} className='flex flex-col' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-5'>
            {state.error}
          </span>
        )}
        <label htmlFor='update_project_name' className='mb-1'>
          Name:
        </label>
        <input
          type='text'
          id='update_project_name'
          className='border p-2 rounded-md mb-5'
          defaultValue={state.data.name}
          onChange={event =>
            setState({ ...state, data: { ...state.data, name: event.target.value }, error: null })
          }
        />
        <label htmlFor='update_project_description' className='mb-1'>
          Description:
        </label>
        <textarea
          id='update_project_description'
          className='border p-2 rounded-md mb-5 min-h-[150px]'
          defaultValue={state.data.description}
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, description: event.target.value },
              error: null,
            })
          }
        />
      </form>
      {children}
    </Modal>
  );
};

export default EditProjectModal;

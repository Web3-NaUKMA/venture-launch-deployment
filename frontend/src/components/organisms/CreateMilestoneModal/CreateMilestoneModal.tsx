import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { createMilestone, selectErrors, setError } from '../../../redux/slices/milestone.slice';
import { Project } from '../../../types/project.types';
import { CreateMilestoneDto } from '../../../types/milestone.types';

export interface CreateMilestoneModalProps extends ModalProps {
  project: Project;
}

interface CreateMilestoneModalState {
  data: {
    mergedPullRequestUrl?: string;
    description?: string;
  };
  error: string | null;
}

const initialState: CreateMilestoneModalState = {
  data: {
    mergedPullRequestUrl: undefined,
    description: undefined,
  },
  error: null,
};

const CreateMilestoneModal: FC<CreateMilestoneModalProps> = ({
  project,
  title,
  onClose,
  onProcess,
  children,
}) => {
  const [state, setState] = useState(initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);

  useEffect(() => {
    dispatch(setError({ createMilestone: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.createMilestone });
  }, [errors.createMilestone]);

  const isDataValid = (data: CreateMilestoneModalState['data']): boolean => {
    if (!data.mergedPullRequestUrl?.trim()) {
      setState({ ...state, error: 'Milestone merged pull request url cannot be empty.' });
      return false;
    }

    return true;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data)) {
      dispatch(
        createMilestone({ ...state.data, projectId: project.id } as CreateMilestoneDto, {
          onSuccess: () => onProcess?.(),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} onProcess={onProcess} className='max-w-[768px]'>
      <form ref={formRef} className='flex flex-col px-10 py-8' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-8 font-mono text-sm'>
            {state.error}
          </span>
        )}
        <div className='flex flex-col gap-2'>
          <div className='flex flex-col'>
            <label
              htmlFor='create_milestone_merged_pull_request_url'
              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
            >
              Merged pull request URL
            </label>
            <input
              type='text'
              id='create_milestone_merged_pull_request_url'
              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono'
              placeholder='https://github.com/project/pull/1'
              defaultValue={state.data.mergedPullRequestUrl}
              onChange={event =>
                setState({
                  ...state,
                  data: { ...state.data, mergedPullRequestUrl: event.target.value },
                  error: null,
                })
              }
            />
          </div>
          <div className='flex flex-col'>
            <label
              htmlFor='create_milestone_description'
              className='mb-1.5 font-sans font-semibold text-zinc-900 text-lg mx-0.5'
            >
              Description
            </label>
            <textarea
              id='create_milestone_description'
              className='border border-stone-400 p-3 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono min-h-[150px] whitespace-pre-wrap'
              placeholder='Milestone description'
              defaultValue={state.data.description}
              onChange={event =>
                setState({
                  ...state,
                  data: { ...state.data, description: event.target.value },
                  error: null,
                })
              }
            />
          </div>
        </div>
        <div className='flex gap-4 mt-10'>
          <button
            type='submit'
            className='inline-flex text-center justify-center items-center bg-zinc-900 border-2 border-transparent hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
          >
            Create
          </button>
          <button
            type='button'
            className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </form>
      {children}
    </Modal>
  );
};

export default CreateMilestoneModal;

import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { IModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { createMilestone, selectErrors, setError } from '../../../redux/slices/milestone.slice';
import { IProject } from '../../../types/project.types';
import { ICreateMilestone } from '../../../types/milestone.types';

export interface ICreateMilestoneModalProps extends IModalProps {
  project: IProject;
}

interface ICreateMilestoneModalState {
  data: {
    mergedPullRequestUrl?: string;
  };
  error: string | null;
}

const initialState: ICreateMilestoneModalState = {
  data: {
    mergedPullRequestUrl: undefined,
  },
  error: null,
};

const CreateMilestoneModal: FC<ICreateMilestoneModalProps> = ({
  project,
  title,
  buttons,
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

  const isDataValid = (data: ICreateMilestoneModalState['data']): boolean => {
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
        createMilestone({ ...state.data, projectId: project.id } as ICreateMilestone, {
          onSuccess: () => buttons?.find(button => button.type === 'accept')?.action(),
        }),
      );
    }
  };

  return (
    <Modal
      title={title}
      buttons={buttons?.map(button =>
        button.type === 'accept'
          ? {
              ...button,
              action: () => {
                if (formRef.current && formRef.current instanceof HTMLFormElement) {
                  formRef.current.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true }),
                  );
                }
              },
            }
          : button,
      )}
      className='max-w-[768px]'
    >
      <form ref={formRef} className='flex flex-col' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-5'>
            {state.error}
          </span>
        )}
        <label htmlFor='create_milestone_merged_pull_request_url' className='mb-1'>
          Merged pull request URL:
        </label>
        <input
          type='text'
          id='create_milestone_merged_pull_request_url'
          className='border p-2 rounded-md mb-5'
          defaultValue={state.data.mergedPullRequestUrl}
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, mergedPullRequestUrl: event.target.value },
              error: null,
            })
          }
        />
      </form>
      {children}
    </Modal>
  );
};

export default CreateMilestoneModal;

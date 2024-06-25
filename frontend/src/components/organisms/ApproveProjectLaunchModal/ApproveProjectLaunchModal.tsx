import { FC, FormEvent, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { ProjectLaunch } from '../../../types/project-launch.types';
import { useAuth } from '../../../hooks/auth.hooks';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import { updateProjectLaunch } from '../../../redux/slices/project-launch.slice';

export interface ApproveProjectLaunchModalProps extends ModalProps {
  projectLaunch: ProjectLaunch;
}

export interface ApproveProjectLaunchModalState {
  data: {
    review?: string;
  };
  error?: any;
}

const initialState: ApproveProjectLaunchModalState = {
  data: {
    review: undefined,
  },
};

const ApproveProjectLaunchModal: FC<ApproveProjectLaunchModalProps> = ({
  title,
  projectLaunch,
  onClose,
  onProcess,
}) => {
  const [state, setState] = useState(initialState);
  const { authenticatedUser } = useAuth();
  const dispatch = useAppDispatch();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as any);

    if (authenticatedUser) {
      formData.set('approverId', authenticatedUser.id);
      formData.set('businessAnalystReview', state.data.review || '');

      dispatch(
        updateProjectLaunch(projectLaunch.id, formData, {
          onError: ({ response }) => setState({ ...state, error: response.data.error }),
          onSuccess: () => onProcess?.(),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[596px]'>
      <form className='flex flex-col px-10 py-8' onSubmit={handleSubmit}>
        <p className='font-mono mb-8 text-justify'>
          Are you sure you want to approve this project launch? If so, leave the project launch
          review as a business analyst. You will also be shown as an approver in the project launch
          info.
        </p>
        <textarea
          id='approve_project_launch_review'
          className='border border-stone-400 p-3 rounded-lg whitespace-pre-wrap text-stone-800 placeholder:text-stone-400 min-h-[170px] font-sans'
          defaultValue={state.data.review}
          placeholder='Project launch review ...'
          onChange={event =>
            setState({
              ...state,
              data: { ...state.data, review: event.target.value },
              error: null,
            })
          }
        />
        <div className='flex gap-4 mt-8'>
          <button
            type='submit'
            className='inline-flex text-center justify-center items-center border-2 border-transparent bg-zinc-900 hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
          >
            Approve
          </button>
          <button
            type='button'
            className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApproveProjectLaunchModal;

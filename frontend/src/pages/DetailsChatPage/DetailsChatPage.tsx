import { ChangeEvent, FC, FormEvent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchChat,
  selectChat,
  selectChats,
  setChat,
  setChats,
} from '../../redux/slices/chat.slice';
import { createMessage, selectMessages, setMessages } from '../../redux/slices/message.slice';
import { useAuth } from '../../hooks/auth.hooks';
import { User } from '../../types/user.types';
import { resolveImage } from '../../utils/file.utils';
import { CheckIcon, PaperAirplaneIcon, PaperClipIcon } from '../../components/atoms/Icons/Icons';

const DetailsChatPage: FC = () => {
  const { id } = useParams();
  const [notFound, setNotFound] = useState(false);
  const [anotherChatMember, setAnotherChatMember] = useState<User | null>(null);
  const dispatch = useAppDispatch();
  const chat = useAppSelector(selectChat);
  const chats = useAppSelector(selectChats);
  const { authenticatedUser } = useAuth();
  const messages = useAppSelector(selectMessages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(
        fetchChat(
          id,
          {
            relations: { messages: { author: true, seenBy: true }, usersToChat: { user: true } },
            order: { messages: { createdAt: 'DESC' } },
          },
          {
            onSuccess: data => dispatch(setMessages(data.messages)),
            onError: () => setNotFound(true),
          },
        ),
      );
    }

    return () => {
      dispatch(setMessages([]));
      dispatch(setChat(null));
    };
  }, [id]);

  useEffect(() => {
    if (chat && authenticatedUser) {
      setAnotherChatMember(
        chat.usersToChat.find(userToChat => userToChat.userId !== authenticatedUser.id)?.user ||
          null,
      );
    }
  }, [chat, authenticatedUser]);

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${event.target.scrollHeight}px`;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (textareaRef.current && textareaRef.current.value?.trim() && authenticatedUser && id) {
      dispatch(
        createMessage(
          {
            author: {
              id: authenticatedUser.id,
            },
            chat: { id },
            content: textareaRef.current.value.trim(),
          },
          {
            onSuccess: data => {
              textareaRef.current!.value = '';
              textareaRef.current!.style.height = 'auto';
              dispatch(
                setChats(
                  chats.map(chat =>
                    chat.id === data.chat?.id
                      ? { ...chat, messages: [data, ...chat.messages] }
                      : chat,
                  ),
                ),
              );
            },
          },
        ),
      );
    }
  };

  return notFound || !chat ? (
    <p>The chat you are looking for was not found or removed</p>
  ) : (
    <>
      <button
        type='button'
        className='flex items-center rounded-t-xl gap-3 px-5 py-3 border-b transition-all duration-300 hover:bg-stone-50'
      >
        <span className='aspect-square'>
          {chat.image || (!chat.isGroup && anotherChatMember?.avatar) ? (
            <img
              src={resolveImage((chat.image || anotherChatMember!.avatar)!)}
              alt='Chat image'
              className='w-[32px] rounded-full aspect-square object-cover'
            />
          ) : (
            <span className='inline-flex items-center justify-center bg-stone-300 w-[32px] rounded-full aspect-square'>
              <span className='text-sm font-bold text-stone-600'>
                {(chat.name ||
                  `${anotherChatMember?.firstName} ${anotherChatMember?.lastName}`)[0].toUpperCase()}
              </span>
            </span>
          )}
        </span>
        <span className='font-semibold text-lg'>
          {chat.name || `${anotherChatMember?.firstName} ${anotherChatMember?.lastName}`}
        </span>
      </button>
      <div className='flex flex-col flex-1 relative'>
        <div className='absolute top-0 bottom-0 left-0 right-0 overflow-y-scroll flex flex-col-reverse with-scrollbar ps-5 pe-2 py-3 gap-0.5 bg-neutral-50'>
          {messages.map((message, index) => (
            <div className='flex flex-col' key={message.id}>
              {new Date(message.createdAt).getDate() !==
                new Date(messages[index + 1]?.createdAt).getDate() && (
                <div className='flex items-center justify-center my-5 border-b border-slate-100'>
                  <span className='absolute border border-stone-200 rounded-full text-[12px] font-medium text-stone-800 px-2 py-0.5 bg-white'>
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
                      new Date(message.createdAt),
                    )}
                  </span>
                </div>
              )}
              <div
                className={`flex items-end gap-2 w-full ${message.author.id === authenticatedUser?.id ? 'flex-row-reverse' : ''}`}
              >
                {message.author.id !== messages[index - 1]?.author?.id ? (
                  <div className='flex aspect-square'>
                    {message.author.avatar ? (
                      <img
                        src={resolveImage(message.author.avatar)}
                        alt='User profile image'
                        className='w-[32px] rounded-full aspect-square object-cover'
                      />
                    ) : (
                      <span className='inline-flex items-center justify-center bg-gray-300 w-[32px] rounded-full aspect-square'></span>
                    )}
                  </div>
                ) : (
                  <span className='inline-flex items-center justify-center bg-transparent w-[32px] aspect-square'></span>
                )}

                <div
                  className={`flex p-2 max-w-xs text-sm gap-2 ${message.author.id === authenticatedUser?.id ? `bg-zinc-900 text-white rounded-tl-2xl rounded-bl-2xl rounded-br-lg ${message.author.id !== messages[index + 1]?.author?.id ? 'rounded-tr-2xl' : 'rounded-tr-lg'}` : `bg-stone-200 rounded-tr-2xl rounded-br-2xl rounded-bl-lg ${message.author.id !== messages[index + 1]?.author?.id ? 'rounded-tl-2xl' : 'rounded-tl-lg'}`}`}
                >
                  <div className='whitespace-pre-wrap'>{message.content}</div>
                  <div className='flex flex-col justify-between items-end'>
                    <span className='text-[10px] leading-4 whitespace-nowrap'>
                      {new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(
                        new Date(message.createdAt),
                      )}
                    </span>
                    {message.author.id === authenticatedUser?.id && (
                      <span className='text-white'>
                        <span className='flex'>
                          <CheckIcon className='size-3.5' />
                          {message.seenBy?.filter(user => user.id !== authenticatedUser?.id)
                            ?.length > 0 && <CheckIcon className='size-3.5 -ml-[10px]' />}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form className='flex border-t rounded-b-xl' onSubmit={handleSubmit}>
        <div className='flex w-full items-center'>
          <button type='button' className='p-3'>
            <PaperClipIcon className='size-5' />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            className='resize-none my-3 max-h-[100px] overflow-y-auto with-scrollbar text-stone-600 placeholder:text-stone-400 !ring-0 !border-none w-full whitespace-pre-wrap'
            placeholder='Write a message...'
            onInput={handleInput}
          />
          <button type='submit' className='p-3'>
            <PaperAirplaneIcon className='size-5' />
          </button>
        </div>
      </form>
    </>
  );
};

export default DetailsChatPage;

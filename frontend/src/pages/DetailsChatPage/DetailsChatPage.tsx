import { ChangeEvent, FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  createChat,
  fetchChat,
  selectChat,
  selectChats,
  selectChatsUnreadMessagesCount,
  selectSocket,
  setChat,
  setChats,
  setChatsUnreadMessagesCount,
} from '../../redux/slices/chat.slice';
import {
  createMessage,
  editMessage,
  selectMessages,
  setMessages,
  updateMessage,
} from '../../redux/slices/message.slice';
import { useAuth } from '../../hooks/auth.hooks';
import { User } from '../../types/user.types';
import { resolveImage } from '../../utils/file.utils';
import {
  CheckIcon,
  CloseIcon,
  CopyIcon,
  EyeIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PencilIcon,
  PinFixedIcon,
  RemoveIcon,
  ReplyIcon,
  UserIcon,
} from '../../components/atoms/Icons/Icons';
import { useOutsideClick } from '../../hooks/dom.hooks';
import { Message } from '../../types/message.types';
import { createPortal } from 'react-dom';
import Modal from '../../components/molecules/Modal/Modal';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../types/enums/app-routes.enum';

const DetailsChatPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const chat = useAppSelector(selectChat);
  const chats = useAppSelector(selectChats);
  const socket = useAppSelector(selectSocket);
  const chatsUnreadMessagesCount = useAppSelector(selectChatsUnreadMessagesCount);
  const { authenticatedUser } = useAuth();
  const messages = useAppSelector(selectMessages);
  const [notFound, setNotFound] = useState(false);
  const [anotherChatMember, setAnotherChatMember] = useState<User | null>(null);
  const [isScrolledToFirstUnread, setIsScrolledToFirstUnread] = useState(false);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [contextMenuVisibleForMessage, setContextMenuVisibleForMessage] = useState<{
    messageId: string;
    x: number;
    y: number;
  } | null>(null);
  const [seenByModalVisibleForMessage, setSeenByModalVisibleForMessage] = useState<Message | null>(
    null,
  );
  const [removeMessageModalVisibleForMessage, setRemoveModalVisibleForMessage] =
    useState<Message | null>(null);
  const [editedMessage, setEditedMessage] = useState<Message | null>(null);
  const [repliedMessage, setRepliedMessage] = useState<Message | null>(null);
  const [pinnedMessagesState, setPinnedMessagesState] = useState<{
    messages: Message[];
    selected: number;
  }>({ messages: [], selected: 0 });
  const [isChatMessagesFetched, setIsChatMessagesFetched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessageFormRef = useRef<HTMLFormElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageContextMenuRef = useOutsideClick(() => setContextMenuVisibleForMessage(null));
  const location = useLocation();

  useEffect(() => {
    if (id) {
      if (id === 'new-chat') {
        if (location?.state?.notStartedChat?.user) {
          setMessages([]);
          dispatch(
            setChat({
              id: 'new-chat',
              name: `${location.state.notStartedChat.user.username} ${location.state.notStartedChat.user.firstName && location.state.notStartedChat.user.lastName ? `(${location.state.notStartedChat.user.firstName} ${location.state.notStartedChat.user.lastName})` : ''}`,
              image: location.state.notStartedChat.user.avatar,
              description: null,
              isGroup: false,
              createdAt: new Date(),
              updatedAt: null,
              removedAt: null,
              usersToChat: [],
              archivedBy: [],
              favouriteFor: [],
              messages: [],
            }),
          );
        } else {
          setNotFound(true);
        }
      } else {
        dispatch(
          fetchChat(
            id,
            {
              where: { messages: { removedAt: null } },
              relations: {
                messages: { author: true, seenBy: true, replyTo: { author: true }, replies: true },
                usersToChat: { user: true },
              },
              order: { messages: { createdAt: 'DESC' } },
            },
            {
              onSuccess: data => {
                dispatch(setMessages(data.messages));
                setPinnedMessagesState({
                  ...pinnedMessagesState,
                  messages: data.messages
                    .filter((message: any) => message.isPinned)
                    .sort(
                      (messageA: any, messageB: any) =>
                        new Date(messageB.createdAt).getTime() -
                        new Date(messageA.createdAt).getTime(),
                    ),
                });
                setIsChatMessagesFetched(true);
              },
              onError: () => setNotFound(true),
            },
          ),
        );
      }
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

      if (location?.state?.messageToCreate) {
        dispatch(
          createMessage(
            {
              author: {
                id: authenticatedUser.id,
              },
              chat: { id: chat.id },
              content: location.state.messageToCreate,
              ...(repliedMessage && { replyTo: { id: repliedMessage.id } }),
            },
            {
              onSuccess: data => {
                textareaRef.current!.value = '';
                textareaRef.current!.style.height = 'auto';

                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = 0;
                }

                setRepliedMessage(null);
                socket?.emit('create-chat', chat.usersToChat);
                dispatch(
                  setChats(
                    chats
                      .map(chat =>
                        chat.id === data.chat?.id
                          ? { ...chat, messages: [data, ...chat.messages] }
                          : chat,
                      )
                      .sort(
                        (chatA, chatB) =>
                          new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                          new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
                      ),
                  ),
                );
              },
            },
          ),
        );
        navigate(AppRoutes.DetailsChat.replace(':id', chat.id));
      }
    }
  }, [chat, authenticatedUser]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', payload => handleSocketReceiveMessage(payload));
      socket.on('receive-pin-message', payload => handleSocketReceivePinMessage(payload));
      socket.on('receive-updated-message', payload => handleSocketReceiveUpdatedMessage(payload));
      socket.on('receive-removed-message', payload => handleSocketReceiveRemovedMessage(payload));
      socket.on('receive-mark-message-as-read', (messageId, user) =>
        handleSocketReceiveMarkAsReadMessage(messageId, user),
      );
    }

    return () => {
      if (socket) {
        socket.off('receive-message');
        socket.off('receive-pin-message');
        socket.off('receive-updated-message');
        socket.off('receive-removed-message');
        socket.off('receive-mark-message-as-read');
      }
    };
  }, [messages, chats, chatsUnreadMessagesCount, socket]);

  useEffect(() => {
    if (isChatMessagesFetched && !firstUnreadMessageId) {
      const firstUnreadMessage = structuredClone(messages)
        .reverse()
        .find(
          message =>
            !message.seenBy?.find(user => user.id === authenticatedUser?.id) &&
            message.author.id !== authenticatedUser?.id,
        );

      if (firstUnreadMessage) {
        setFirstUnreadMessageId(firstUnreadMessage.id);
      }

      setIsScrolledToFirstUnread(true);
    }
  }, [isChatMessagesFetched]);

  useEffect(() => {
    if (firstUnreadMessageId && messagesContainerRef.current) {
      const messageElement = messagesContainerRef.current.querySelector(
        `[data-id="${firstUnreadMessageId}"]`,
      );

      if (messageElement) {
        messageElement.scrollIntoView({ block: 'start' });
      }
    }
  }, [firstUnreadMessageId, messagesContainerRef]);

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${event.target.scrollHeight}px`;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (textareaRef.current && textareaRef.current.value?.trim() && authenticatedUser && id) {
      if (id === 'new-chat' && location?.state?.notStartedChat?.user?.id) {
        const formData = new FormData();
        formData.append('usersToAdd[0][id]', authenticatedUser.id);
        formData.append('usersToAdd[1][id]', location.state.notStartedChat.user.id);
        dispatch(
          createChat(formData, {
            onSuccess: data => {
              navigate(AppRoutes.DetailsChat.replace(':id', data.id), {
                state: { messageToCreate: textareaRef.current!.value.trim() },
              });
            },
          }),
        );
        return;
      }
      if (editedMessage && textareaRef.current.value.trim() !== editedMessage.content) {
        dispatch(
          updateMessage(
            editedMessage.id,
            { content: textareaRef.current.value.trim() },
            {
              onSuccess: data => {
                textareaRef.current!.value = '';
                textareaRef.current!.style.height = 'auto';

                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = 0;
                }

                socket?.emit('update-message', data, id);
                dispatch(
                  setChats(
                    chats
                      .map(chat =>
                        chat.id === data.chat?.id
                          ? {
                              ...chat,
                              messages: chat.messages.map(m => (m.id === data.id ? data : m)),
                            }
                          : chat,
                      )
                      .sort(
                        (chatA, chatB) =>
                          new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                          new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
                      ),
                  ),
                );
                setEditedMessage(null);
              },
            },
          ),
        );
        return;
      }

      dispatch(
        createMessage(
          {
            author: {
              id: authenticatedUser.id,
            },
            chat: { id },
            content: textareaRef.current.value.trim(),
            ...(repliedMessage && { replyTo: { id: repliedMessage.id } }),
          },
          {
            onSuccess: data => {
              textareaRef.current!.value = '';
              textareaRef.current!.style.height = 'auto';

              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = 0;
              }

              setRepliedMessage(null);
              socket?.emit('send-message', data, id);
              dispatch(
                setChats(
                  chats
                    .map(chat =>
                      chat.id === data.chat?.id
                        ? { ...chat, messages: [data, ...chat.messages] }
                        : chat,
                    )
                    .sort(
                      (chatA, chatB) =>
                        new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                        new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
                    ),
                ),
              );
            },
          },
        ),
      );
    }
  };

  const handleTextareaKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = event => {
    if (event.key === 'Enter') {
      if (event.ctrlKey) {
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          textareaRef.current.value =
            textareaRef.current.value.substring(0, start) +
            '\n' +
            textareaRef.current.value.substring(end);
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;

          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
          }
          event.preventDefault();
        }
      } else {
        event.preventDefault();

        if (sendMessageFormRef.current) {
          sendMessageFormRef.current.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true }),
          );
        }
      }
    }
  };

  const handleSocketReceiveMessage = (payload: any) => {
    const chatsUnreadMessagesCountCopy = structuredClone(chatsUnreadMessagesCount);
    if (payload.author.id !== authenticatedUser?.id && payload.chat?.id === id) {
      dispatch(
        setMessages([
          payload,
          ...messages.map(m =>
            m.id === payload.replyTo?.id ? { ...m, replies: [payload, ...(m.replies || [])] } : m,
          ),
        ]),
      );
      chatsUnreadMessagesCountCopy[id!]++;

      if (messagesContainerRef.current && messagesContainerRef.current.scrollTop > -200) {
        messagesContainerRef.current.scrollTop = 0;
      }
    }
    dispatch(setChatsUnreadMessagesCount(chatsUnreadMessagesCountCopy));
  };

  const handleSocketReceivePinMessage = (payload: any) => {
    if (payload.chat?.id === id) {
      dispatch(editMessage(payload));
      setPinnedMessagesState(prevState => ({
        ...prevState,
        messages: (payload.isPinned
          ? [...prevState.messages, payload]
          : prevState.messages.filter(message => message.id !== payload.id)
        ).sort(
          (messageA, messageB) =>
            new Date(messageB.createdAt).getTime() - new Date(messageA.createdAt).getTime(),
        ),
      }));
      setPinnedMessagesState(prevState => ({
        ...prevState,
        selected:
          prevState.messages.length === 1 ? 0 : prevState.selected % prevState.messages.length,
      }));
    }
  };

  const handleSocketReceiveUpdatedMessage = (payload: any) => {
    if (payload.chat?.id === id) {
      dispatch(
        setMessages(
          messages.map(message =>
            message.id === payload.id
              ? payload
              : payload?.replies.find((r: any) => r.id === message.id)
                ? { ...message, replyTo: payload }
                : message,
          ),
        ),
      );
    }
  };

  const handleSocketReceiveRemovedMessage = (payload: any) => {
    if (payload.author.id !== authenticatedUser?.id && payload.chat?.id === id) {
      dispatch(
        setMessages(
          messages
            .filter(message => message.id !== payload.id)
            .map(m => (m.replyTo?.id === payload.id ? { ...m, replyTo: payload } : m)),
        ),
      );
    }
  };

  const handleSocketReceiveMarkAsReadMessage = (messageId: string, user: any) => {
    if (user.id !== authenticatedUser?.id) {
      dispatch(
        setMessages(
          messages.map(message =>
            message.id === messageId ? { ...message, seenBy: [...message.seenBy, user] } : message,
          ),
        ),
      );
    } else {
      const chatsUnreadMessagesCountCopy = structuredClone(chatsUnreadMessagesCount);
      chatsUnreadMessagesCountCopy[id!]--;
      dispatch(setChatsUnreadMessagesCount(chatsUnreadMessagesCountCopy));
    }
  };

  const handlePinMessage = (message: Message) => {
    dispatch(
      updateMessage(
        message.id,
        { isPinned: !message.isPinned },
        {
          onSuccess: data => {
            socket?.emit('pin-message', data, id);
          },
        },
      ),
    );
  };

  const handleRemoveMessage = (message: Message) => {
    dispatch(
      updateMessage(
        message.id,
        { removedAt: new Date() },
        {
          onSuccess: data => {
            socket?.emit('remove-message', data, id);

            if (data.isPinned) {
              socket?.emit('pin-message', { ...data, isPinned: false }, id);
            }

            dispatch(
              setMessages(
                messages
                  .filter(message => message.id !== data.id)
                  .map(message =>
                    message.replyTo?.id === data.id ? { ...message, replyTo: data } : message,
                  ),
              ),
            );
            dispatch(
              setChats(
                chats
                  .map(chat =>
                    chat.id === data.chat?.id
                      ? {
                          ...chat,
                          messages: chat.messages
                            .filter(m => m.id !== data.id)
                            .map(m => (m.replyTo?.id === data.id ? { ...m, replyTo: data } : m)),
                        }
                      : chat,
                  )
                  .sort(
                    (chatA, chatB) =>
                      new Date(chatB.messages[0]?.createdAt || chatB.createdAt).getTime() -
                      new Date(chatA.messages[0]?.createdAt || chatA.createdAt).getTime(),
                  ),
              ),
            );
            setRemoveModalVisibleForMessage(null);
          },
        },
      ),
    );
  };

  const observeMessages = useCallback(
    (node: HTMLDivElement | null) => {
      if (isScrolledToFirstUnread && socket && node) {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }

        const options = {
          root: messagesContainerRef.current,
          threshold: 0.001,
        };

        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const messageId = entry.target.getAttribute('data-id');
              if (messageId) {
                const message = messages.find(m => m.id === messageId);

                if (
                  message &&
                  authenticatedUser &&
                  !message.seenBy?.find(user => user.id === authenticatedUser.id) &&
                  message.author.id !== authenticatedUser.id
                ) {
                  socket.emit('send-mark-message-as-read', id, messageId, authenticatedUser);
                  dispatch(updateMessage(messageId, { seenBy: authenticatedUser.id }));
                }
              }
            }
          });
        }, options);

        observerRef.current = observer;

        node.querySelectorAll<HTMLDivElement>('[data-id]').forEach(messageNode => {
          observer.observe(messageNode);
        });
      }
    },
    [
      dispatch,
      updateMessage,
      messages,
      chats,
      id,
      socket,
      authenticatedUser,
      isScrolledToFirstUnread,
    ],
  );

  useEffect(() => {
    observeMessages(messagesContainerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observeMessages]);

  return notFound ? (
    <div className='flex flex-col flex-1 items-center justify-center rounded-xl m-3 border-2 border-dashed border-stone-200'>
      <span className='font-mono text-stone-400'>
        The chat you are looking for was not found or removed
      </span>
    </div>
  ) : (
    chat && (
      <>
        {seenByModalVisibleForMessage &&
          createPortal(
            <Modal
              title='Seen by'
              onClose={() => setSeenByModalVisibleForMessage(null)}
              className='max-w-xl'
            >
              <div className='px-5 py-5 flex flex-col gap-1'>
                {!seenByModalVisibleForMessage.seenBy?.length && (
                  <span className='flex items-center gap-5 p-5 text-center justify-center font-mono text-stone-600 rounded-xl border-2 border-dashed border-stone-200'>
                    Nobody has seen this message yet
                  </span>
                )}
                {seenByModalVisibleForMessage.seenBy?.map(user => (
                  <Link
                    to={AppRoutes.DetailsUser.replace(':id', user.id)}
                    key={user.id}
                    className='flex items-center gap-5 hover:bg-stone-100 transition-all duration-300 px-5 py-2 rounded-xl'
                  >
                    <span className='flex'>
                      {user.avatar ? (
                        <img
                          src={resolveImage(user.avatar)}
                          alt='User profile image'
                          className='w-[48px] rounded-full aspect-square object-cover'
                        />
                      ) : (
                        <span className='inline-flex items-center justify-center bg-gray-300 w-[48px] rounded-full aspect-square'>
                          <UserIcon className='size-5' />
                        </span>
                      )}
                    </span>
                    <span className='flex flex-col relative'>
                      <h3 className='font-sans font-semibold'>
                        {user.username}{' '}
                        {user.firstName && user.lastName
                          ? `(${user.firstName} ${user.lastName})`
                          : ''}
                      </h3>
                    </span>
                  </Link>
                ))}
              </div>
            </Modal>,
            document.querySelector('body')!,
          )}
        {removeMessageModalVisibleForMessage &&
          createPortal(
            <Modal
              title={'Remove message'}
              onClose={() => setRemoveModalVisibleForMessage(null)}
              className='max-w-xl'
            >
              <div className='px-10 py-8'>
                <p className='text-mono'>
                  Are you sure you want to delete selected message? This action is irreversible.
                </p>
                <div className='mt-8 flex gap-4'>
                  <button
                    type='button'
                    className='inline-flex text-center justify-center items-center bg-red-500 hover:bg-red-400 text-white rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                    onClick={() => handleRemoveMessage(removeMessageModalVisibleForMessage)}
                  >
                    Delete
                  </button>
                  <button
                    type='button'
                    className='inline-flex text-center justify-center items-center text-zinc-700 border-2 border-zinc-900 hover:text-zinc-900 hover:bg-slate-100 rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
                    onClick={() => setRemoveModalVisibleForMessage(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Modal>,
            document.querySelector('body')!,
          )}
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
                    `${anotherChatMember?.username} ${anotherChatMember?.firstName && anotherChatMember?.lastName ? `(${anotherChatMember?.firstName} ${anotherChatMember?.lastName})` : ``}`)[0].toUpperCase()}
                </span>
              </span>
            )}
          </span>
          <span className='font-semibold text-lg'>
            {chat.name ||
              `${anotherChatMember?.username} ${anotherChatMember?.firstName && anotherChatMember?.lastName ? `(${anotherChatMember?.firstName} ${anotherChatMember?.lastName})` : ``}`}
          </span>
        </button>
        {pinnedMessagesState.messages.length > 0 && (
          <div
            className='flex items-center justify-between px-3 py-1 border-b bg-slate-100 gap-3 cursor-pointer hover:bg-slate-200 transition-all duration-300'
            onClick={() => {
              if (messagesContainerRef.current) {
                const messageElement = messagesContainerRef.current.querySelector(
                  `.message[data-id="${pinnedMessagesState.messages[(pinnedMessagesState.selected + 1) % pinnedMessagesState.messages.length].id}"]`,
                ) as HTMLElement | null;

                if (messageElement) {
                  messagesContainerRef.current.scrollTop = messageElement.offsetTop;
                }
              }
              setPinnedMessagesState({
                ...pinnedMessagesState,
                selected: (pinnedMessagesState.selected + 1) % pinnedMessagesState.messages.length,
              });
            }}
          >
            <div className='flex gap-3 items-center'>
              <PinFixedIcon className='size-5 text-stone-600' />
              <div className='flex flex-col'>
                <h6 className='font-semibold text-xs mb-0.5 text-stone-700'>
                  Pinned message #{pinnedMessagesState.selected + 1} of{' '}
                  {pinnedMessagesState.messages.length}
                </h6>
                <span
                  className='text-xs text-stone-600 whitespace-pre-wrap'
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {pinnedMessagesState.messages[pinnedMessagesState.selected].content}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className='flex flex-col flex-1 relative'>
          <div
            ref={messagesContainerRef}
            className='absolute top-0 bottom-0 left-0 right-0 overflow-y-scroll flex flex-col-reverse with-scrollbar ps-5 pe-2 py-3 gap-0.5 bg-neutral-50'
            onScroll={event => {
              if ((event.target as any).scrollTop > -10) {
                setTimeout(() => {
                  const chatsUnreadMessagesCountCopy = structuredClone(chatsUnreadMessagesCount);
                  chatsUnreadMessagesCountCopy[id!] = 0;
                  dispatch(setChatsUnreadMessagesCount(chatsUnreadMessagesCountCopy));
                }, 500);
              }
            }}
          >
            {messages.map((message, index) => (
              <div
                className={`flex flex-col message ${
                  message.author.id !== messages[index + 1]?.author?.id &&
                  new Date(message.createdAt).getDate() ===
                    new Date(messages[index + 1]?.createdAt).getDate()
                    ? 'mt-2'
                    : ''
                }`}
                key={message.id}
                data-id={message.id}
              >
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
                {message.id === firstUnreadMessageId && (
                  <div className='flex items-center justify-center p-0.5 px-5 text-stone-800 text-sm font-medium rounded-md bg-stone-200 my-3'>
                    Unread messages
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
                        <span className='inline-flex items-center justify-center bg-gray-300 w-[32px] rounded-full aspect-square'>
                          <UserIcon className='size-3' />
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className='inline-flex items-center justify-center bg-transparent w-[32px] aspect-square'>
                      <UserIcon className='size-3' />
                    </span>
                  )}
                  <div
                    className={`flex relative p-2 max-w-xs text-sm gap-2 cursor-default ${message.author.id === authenticatedUser?.id ? `bg-zinc-900 text-white rounded-tl-2xl rounded-bl-2xl rounded-br-lg ${message.author.id !== messages[index + 1]?.author?.id ? 'rounded-tr-2xl' : 'rounded-tr-lg'}` : `bg-stone-200 rounded-tr-2xl rounded-br-2xl rounded-bl-lg ${message.author.id !== messages[index + 1]?.author?.id ? 'rounded-tl-2xl' : 'rounded-tl-lg'}`}`}
                    onContextMenu={event => {
                      event.preventDefault();
                      setContextMenuVisibleForMessage({
                        messageId: message.id,
                        x: event.clientX,
                        y: event.clientY,
                      });
                    }}
                  >
                    {contextMenuVisibleForMessage?.messageId === message.id && (
                      <div
                        ref={messageContextMenuRef}
                        className='min-w-[200px] flex flex-col bg-white shadow-[0_0_15px_-7px_silver] rounded-lg fixed -mt-1.5 z-10 p-2 text-black'
                        style={{
                          left: contextMenuVisibleForMessage.x,
                          top: contextMenuVisibleForMessage.y,
                        }}
                      >
                        <div className='flex flex-col gap-0.5'>
                          {message.author?.id === authenticatedUser?.id && (
                            <>
                              <span
                                className='px-2 py-1 inline-flex items-center rounded-lg hover:bg-stone-100 transition-all duration-300 cursor-pointer font-medium gap-2'
                                onClick={() => {
                                  setRepliedMessage(null);
                                  setEditedMessage(message);
                                  if (textareaRef.current) {
                                    textareaRef.current.focus();
                                    textareaRef.current.value = message.content;
                                    setContextMenuVisibleForMessage(null);
                                  }
                                }}
                              >
                                <PencilIcon className='size-4' />
                                <span>Edit</span>
                              </span>
                              <span
                                className='px-2 py-1 inline-flex items-center rounded-lg hover:bg-stone-100 transition-all duration-300 cursor-pointer font-medium gap-2'
                                onClick={() => setRemoveModalVisibleForMessage(message)}
                              >
                                <RemoveIcon className='size-4' />
                                <span>Remove</span>
                              </span>
                            </>
                          )}
                          <span
                            className='px-2 py-1 inline-flex items-center rounded-lg hover:bg-stone-100 transition-all duration-300 cursor-pointer font-medium gap-2'
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              setContextMenuVisibleForMessage(null);
                            }}
                          >
                            <CopyIcon className='size-4 text-zinc-600' />
                            <span>Copy</span>
                          </span>
                          <span
                            className='px-2 py-1 inline-flex items-center rounded-lg hover:bg-stone-100 transition-all duration-300 cursor-pointer font-medium gap-2'
                            onClick={() => {
                              handlePinMessage(message);
                              setContextMenuVisibleForMessage(null);
                            }}
                          >
                            {!message.isPinned ? (
                              <>
                                <PinFixedIcon className='size-4 text-zinc-600' />
                                <span>Pin</span>
                              </>
                            ) : (
                              <>
                                <PinFixedIcon className='size-4 text-zinc-600' />
                                <span>Unpin</span>
                              </>
                            )}
                          </span>
                          <span
                            className='px-2 py-1 inline-flex items-center rounded-lg hover:bg-stone-100 transition-all duration-300 cursor-pointer font-medium gap-2'
                            onClick={() => {
                              setEditedMessage(null);
                              setRepliedMessage(message);
                              if (textareaRef.current) {
                                textareaRef.current.focus();
                                setContextMenuVisibleForMessage(null);
                              }
                            }}
                          >
                            <ReplyIcon className='size-4' />
                            <span>Reply</span>
                          </span>
                        </div>
                        <hr className='my-2' />
                        <div
                          className='px-2 py-1 inline-flex items-center rounded-lg hover:bg-stone-100 transition-all duration-300 cursor-pointer font-medium gap-2'
                          onClick={() => setSeenByModalVisibleForMessage(message)}
                        >
                          <EyeIcon className='size-4' />
                          <span>Seen by</span>
                          <div className='flex px-2'>
                            {message.seenBy?.[0] &&
                              (message.seenBy[0].avatar ? (
                                <img
                                  src={resolveImage(message.seenBy[0].avatar)}
                                  alt='User profile image'
                                  className='w-[24px] rounded-full aspect-square object-cover z-30 border-2 border-stone-500'
                                />
                              ) : (
                                <span className='inline-flex items-center justify-center bg-gray-300 w-[24px] rounded-full aspect-square z-30 border-2 border-stone-500'>
                                  <UserIcon className='size-3' />
                                </span>
                              ))}
                            {message.seenBy?.[1] &&
                              (message.seenBy[1].avatar ? (
                                <img
                                  src={resolveImage(message.seenBy[1].avatar)}
                                  alt='User profile image'
                                  className='w-[24px] rounded-full aspect-square object-cover -ms-3 z-20 border-2 border-stone-500'
                                />
                              ) : (
                                <span className='inline-flex items-center justify-center bg-gray-300 w-[24px] rounded-full aspect-square -ms-3 z-20 border-2 border-stone-500'>
                                  <UserIcon className='size-3' />
                                </span>
                              ))}
                            {message.seenBy?.[2] &&
                              (message.seenBy[2].avatar ? (
                                <img
                                  src={resolveImage(message.seenBy[2].avatar)}
                                  alt='User profile image'
                                  className='w-[24px] rounded-full aspect-square object-cover -ms-3 z-10 border-2 border-stone-500'
                                />
                              ) : (
                                <span className='inline-flex items-center justify-center bg-gray-300 w-[24px] rounded-full aspect-square -ms-3 z-10 border-2 border-stone-500'>
                                  <UserIcon className='size-3' />
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className='whitespace-pre-wrap flex flex-col'>
                      {message.content}
                      {message.replyTo && (
                        <span
                          className={`flex flex-col whitespace-pre-wrap text-xs mt-1 p-1 rounded w-full border-l-4 cursor-pointer ${message.author.id === authenticatedUser?.id ? `bg-zinc-600 border-zinc-700` : `bg-stone-300 border-stone-400`}`}
                          onClick={() => {
                            if (messagesContainerRef.current) {
                              const messageNode = messagesContainerRef.current.querySelector(
                                `.message[data-id="${message.replyTo?.id}"]`,
                              ) as HTMLElement | null;

                              if (messageNode) {
                                messagesContainerRef.current.scrollTop = messageNode.offsetTop;
                              }
                            }
                          }}
                        >
                          <h6 className='font-medium mb-1'>
                            {message.replyTo?.author?.username}{' '}
                            {message.replyTo?.author?.firstName &&
                              message.replyTo?.author?.lastName &&
                              `(${message.replyTo?.author?.firstName} ${message.replyTo?.author?.lastName})`}
                          </h6>
                          {message.replyTo?.removedAt !== null ? (
                            <span className='italic'>Deleted message</span>
                          ) : (
                            <span>{message.replyTo?.content}</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className='flex flex-col justify-between items-end'>
                      <span className='text-[10px] leading-4 whitespace-nowrap'>
                        {new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(
                          new Date(message.createdAt),
                        )}
                      </span>
                      <div className='inline-flex gap-1 items-center'>
                        {message.updatedAt !== null && message.updatedAt !== message.createdAt && (
                          <span className='text-[11px] font-medium'>edited</span>
                        )}
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
              </div>
            ))}
          </div>
        </div>
        <form
          className='flex flex-col border-t rounded-b-xl'
          onSubmit={handleSubmit}
          ref={sendMessageFormRef}
        >
          {(editedMessage || repliedMessage) && (
            <div
              className='flex items-center justify-between px-3 py-1 border-b bg-slate-100 gap-3 cursor-pointer hover:bg-slate-200 transition-all duration-300'
              onClick={() => {
                if (messagesContainerRef.current) {
                  const messageNode = messagesContainerRef.current.querySelector(
                    `.message[data-id="${editedMessage ? editedMessage.id : repliedMessage ? repliedMessage.id : ''}"]`,
                  ) as HTMLElement | null;

                  if (messageNode) {
                    messagesContainerRef.current.scrollTop = messageNode.offsetTop;
                  }
                }
              }}
            >
              <div className='flex gap-3 items-center'>
                {editedMessage ? (
                  <PencilIcon className='size-5' />
                ) : (
                  <ReplyIcon className='size-5' />
                )}
                <div className='flex flex-col'>
                  <h6 className='font-semibold text-xs mb-0.5 text-stone-700'>
                    {editedMessage
                      ? 'Edit message'
                      : `Reply to ${repliedMessage?.author?.username} ${repliedMessage?.author?.firstName && repliedMessage?.author?.lastName && `(${repliedMessage?.author?.firstName} ${repliedMessage?.author?.lastName})`}`}
                  </h6>
                  <span
                    className='text-xs text-stone-600 whitespace-pre-wrap'
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {editedMessage
                      ? editedMessage.content
                      : repliedMessage
                        ? repliedMessage.content
                        : ''}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <button
                  type='button'
                  className='p-2 hover:bg-stone-200 rounded-lg transition-all duration-300'
                  onClick={() => {
                    setEditedMessage(null);
                    setRepliedMessage(null);
                    if (textareaRef.current) {
                      textareaRef.current.value = '';
                    }
                  }}
                >
                  <CloseIcon className='size-3 text-stone-600' />
                </button>
              </div>
            </div>
          )}
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
              onKeyDown={handleTextareaKeyDown}
              autoFocus
            />
            <button type='submit' className='p-3'>
              <PaperAirplaneIcon className='size-5' />
            </button>
          </div>
        </form>
      </>
    )
  );
};

export default DetailsChatPage;

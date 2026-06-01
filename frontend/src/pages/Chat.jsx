import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';
import { normalizeId } from '../utils/ids';

const messageKey = (m) => {
  if (m?._id) return String(m._id);
  const t = m?.createdAt || m?.timestamp || '';
  return `${normalizeId(m?.senderId)}-${t}-${m?.message}`;
};

const upsertMessage = (list, incoming) => {
  const key = messageKey(incoming);
  if (list.some((m) => messageKey(m) === key)) return list;
  return [...list, incoming];
};

const Chat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activePeer, setActivePeer] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const activePeerRef = useRef(activePeer);
  const myId = normalizeId(user?._id);

  activePeerRef.current = activePeer;

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data.conversations || [];
    },
    enabled: !!myId,
  });

  const activeContact = useMemo(
    () => conversations?.find((c) => normalizeId(c.user._id) === normalizeId(activePeer))?.user,
    [conversations, activePeer]
  );

  const peerName = activeContact?.name || 'Contact';

  useEffect(() => {
    if (!myId) return;
    const socket = connectSocket(myId);

    const onReceive = (msg) => {
      const senderId = normalizeId(msg.senderId);
      // Sender already added the message from the POST response — ignore echo
      if (senderId === myId) return;

      const peerId = senderId;
      if (activePeerRef.current && peerId === normalizeId(activePeerRef.current)) {
        setMessages((prev) => upsertMessage(prev, msg));
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.off('chat:receive');
    socket.on('chat:receive', onReceive);

    return () => {
      socket.off('chat:receive', onReceive);
    };
  }, [myId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (contact) => {
    const peerId = normalizeId(contact.user._id);
    setActivePeer(peerId);
    setSendError('');
    const res = await api.get('/messages', { params: { withUserId: peerId } });
    const loaded = res.data.messages || [];
    const seen = new Set();
    setMessages(
      loaded.filter((m) => {
        const key = messageKey(m);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
    );
  };

  const isMine = (m) => normalizeId(m.senderId) === myId;

  const senderLabel = (m) => {
    if (isMine(m)) return 'You';
    return m.senderId?.name || peerName;
  };

  const formatTime = (m) => {
    const t = m.createdAt || m.timestamp;
    if (!t) return '';
    return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = useCallback(async () => {
    if (sending || !message.trim() || !activePeer || !myId) {
      if (!activePeer) setSendError('Select a conversation first.');
      return;
    }
    setSendError('');
    const text = message.trim();
    setSending(true);
    try {
      const { data } = await api.post('/messages', { receiverId: activePeer, message: text });
      const saved = data.message;
      setMessages((prev) => upsertMessage(prev, saved));
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err) {
      setSendError(err?.response?.data?.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  }, [sending, message, activePeer, myId, queryClient]);

  return (
    <div className="space-y-6">
      <PageHeader title="Chat" subtitle="Messages saved in database — real-time delivery." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="max-h-[28rem] space-y-2 overflow-y-auto md:col-span-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Conversations</p>
          {!conversations?.length ? (
            <p className="text-sm text-slate-500">No chats yet. Start from orders or contacts.</p>
          ) : (
            conversations.map(({ user: contact, lastMessage }) => {
              const contactId = normalizeId(contact._id);
              const selected = normalizeId(activePeer) === contactId;
              const lastFromMe = lastMessage && normalizeId(lastMessage.senderId) === myId;
              return (
                <button
                  key={contactId}
                  type="button"
                  onClick={() => loadMessages({ user: contact })}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selected
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs capitalize text-slate-500">{contact.role?.replace('_', ' ')}</p>
                  {lastMessage && (
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {lastFromMe ? 'You: ' : ''}
                      {lastMessage.message}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </Card>
        <Card className="flex h-[28rem] flex-col md:col-span-2">
          {activePeer ? (
            <>
              <div className="border-b pb-2 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Chat with {peerName}
                </p>
                <p className="text-xs text-slate-500">
                  Your messages appear on the right (green). {peerName}&apos;s on the left.
                </p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto py-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-slate-500">No messages yet. Say hello!</p>
                ) : (
                  messages.map((m) => {
                    const mine = isMine(m);
                    return (
                      <div
                        key={messageKey(m)}
                        className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                      >
                        <span
                          className={`mb-1 text-xs font-medium ${
                            mine ? 'text-brand-green' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {senderLabel(m)}
                        </span>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            mine
                              ? 'rounded-br-md bg-brand-green text-white'
                              : 'rounded-bl-md bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {m.message}
                        </div>
                        {formatTime(m) && (
                          <span className="mt-0.5 text-[10px] text-slate-400">{formatTime(m)}</span>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 border-t pt-3 dark:border-slate-800">
                <input
                  className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Message ${peerName}...`}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
              {sendError && <p className="mt-2 text-sm text-red-600">{sendError}</p>}
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a conversation to start chatting.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;

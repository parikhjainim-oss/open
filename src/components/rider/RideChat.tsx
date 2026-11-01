import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { authApi, USE_REMOTE_AUTH, liveApi, RideChatMessage } from '../../services/api';

interface RideChatProps {
  rideId: string;
  open: boolean;
  onToggle: () => void;
  peerName?: string;
}

const QUICK_REPLIES = ['I am on my way', 'Please wait 2 minutes', 'I have arrived', 'At the gate', 'Call me'];

/**
 * Rider ↔ Captain chat bubble, polling the backend every 3 seconds while open.
 * In offline demo mode it renders but disables sending (no ride backend).
 */
export const RideChat: React.FC<RideChatProps> = ({ rideId, open, onToggle, peerName = 'Captain' }) => {
  const [messages, setMessages] = useState<RideChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !USE_REMOTE_AUTH) return;
    const session = authApi.getSession();
    if (!session) return;
    let stopped = false;
    const poll = () => {
      liveApi.messages(session.token, rideId, lastIdRef.current)
        .then((data: { messages: RideChatMessage[] }) => {
          if (stopped || !data.messages.length) return;
          lastIdRef.current = data.messages[data.messages.length - 1].id;
          setMessages((prev) => [...prev, ...data.messages]);
        })
        .catch(() => { /* transient */ });
    };
    poll();
    const interval = window.setInterval(poll, 3000);
    return () => { stopped = true; window.clearInterval(interval); };
  }, [open, rideId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const session = authApi.getSession();
    if (!session || !USE_REMOTE_AUTH) { setSending(false); setDraft(''); return; }
    liveApi.sendMessage(session.token, rideId, trimmed)
      .then((data) => {
        if (data.message) {
          lastIdRef.current = data.message.id;
          setMessages((prev) => [...prev, data.message as RideChatMessage]);
        }
        setDraft('');
      })
      .catch(() => { /* keep draft on failure */ })
      .finally(() => setSending(false));
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="absolute bottom-20 right-4 z-20 rounded-full bg-white p-3 text-gray-700 shadow-lg hover:text-[#FF6B00]"
      >
        {open ? <X size={19} /> : <MessageSquare size={19} />}
      </button>
      {open && (
        <div className="absolute bottom-36 right-4 z-30 flex w-72 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="bg-[#171717] px-3 py-2.5">
            <p className="text-xs font-bold text-white">Chat with {peerName}</p>
            <p className="text-[10px] text-gray-400">Messages delete after the trip</p>
          </div>
          <div ref={listRef} className="flex max-h-56 flex-col gap-2 overflow-y-auto px-3 py-3">
            {!USE_REMOTE_AUTH && <p className="rounded-lg bg-blue-50 px-2 py-2 text-[11px] text-blue-900">Chat connects when the ride API is configured (VITE_AUTH_MODE=api).</p>}
            {messages.length === 0 && USE_REMOTE_AUTH && <p className="text-center text-[11px] text-gray-400">Say hello 👋</p>}
            {messages.map((message) => {
              const mine = message.senderRole === 'rider';
              return (
                <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${mine ? 'self-end bg-[#FF6B00] text-white' : 'self-start bg-gray-100 text-gray-900'}`}>
                  {message.text}
                  <span className={`mt-0.5 block text-[9px] ${mine ? 'text-orange-100' : 'text-gray-400'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-gray-100 px-2 py-1.5 no-scrollbar">
            {QUICK_REPLIES.map((reply) => (
              <button key={reply} type="button" onClick={() => send(reply)} className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#A04100]">{reply}</button>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); send(draft); }} className="flex items-center gap-2 border-t border-gray-100 px-2 py-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message…"
              aria-label="Chat message"
              maxLength={500}
              className="min-w-0 flex-1 rounded-xl bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
            />
            <button type="submit" disabled={sending || !draft.trim()} aria-label="Send message" className="rounded-xl bg-[#FF6B00] p-2 text-white disabled:opacity-40">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

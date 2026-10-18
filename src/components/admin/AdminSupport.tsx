import React, { useState } from 'react';
import { store } from '../../services/store';
import { SupportTicket } from '../../types';
import { HelpCircle, ShieldAlert, CheckCircle2, MessageSquare, AlertTriangle, Send } from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const tickets = store.getState().tickets;
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleResolve = (ticketId: string) => {
    store.resolveTicket(ticketId, 'Incident investigated and resolved in accordance with Gujarat Transport safety policy.');
    setSelectedTicket(null);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    selectedTicket.messages.push({
      sender: 'Fleet Support Specialist',
      role: 'support',
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setReplyText('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Support & Safety Incidents</h2>
          <p className="text-xs text-gray-500">Passenger grievances, SOS emergency audits, and fare disputes</p>
        </div>
        <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          {tickets.filter((t) => t.status !== 'resolved').length} Open Incident(s)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTicket(t)}
            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3 cursor-pointer hover:border-gray-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 font-mono block">{t.id}</span>
                <h3 className="text-sm font-bold text-gray-900">{t.subject}</h3>
                <p className="text-xs text-gray-500">
                  {t.userName} ({t.userRole.toUpperCase()})
                </p>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  t.priority === 'urgent' || t.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {t.priority} Priority
              </span>
            </div>

            <p className="text-xs text-gray-600 bg-[#F7F8FA] p-2.5 rounded-xl border border-gray-100 line-clamp-2">
              &ldquo;{t.messages[0]?.text}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-gray-400">{t.createdAt}</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  t.status === 'resolved'
                    ? 'text-green-700 bg-green-50'
                    : 'text-amber-700 bg-amber-50'
                }`}
              >
                {t.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Details & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedTicket.id} • {selectedTicket.userName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Conversation Log */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto p-3 bg-gray-50 rounded-xl border">
              {selectedTicket.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl text-xs ${
                    msg.role === 'support'
                      ? 'bg-blue-50 border border-blue-200 text-blue-900 ml-4'
                      : 'bg-white border border-gray-200 text-gray-800 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-0.5">
                    <span>{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                placeholder="Type response to rider / captain..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border rounded-xl outline-none focus:border-[#FF6B00]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>

            {/* Resolution Action */}
            {selectedTicket.status !== 'resolved' && (
              <button
                type="button"
                onClick={() => handleResolve(selectedTicket.id)}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Mark Incident as Investigated & Resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Sparkles, Send, Loader2, Bot, HelpCircle, ShieldCheck } from 'lucide-react';

interface GeminiAssistantModalProps {
  onClose: () => void;
  activePnr?: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  onClose,
  activePnr,
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; source?: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! I am RailSathi AI, your smart railway passenger companion. Ask me anything about your PNR status, coach allocations, luggage limits, IRCTC refund slab rules, or meal catering.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    activePnr ? `Explain my booking status for PNR ${activePnr}` : 'How does PNR confirmation and RAC work?',
    'What is the ticket cancellation & refund policy?',
    'What is the free luggage allowance for AC 3-Tier?',
    'What are the Tatkal booking timings for AC & Sleeper?',
  ];

  const handleSend = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    const query = userQuery.trim();
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await api.askAiAssistant(query, activePnr);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.reply,
          source: response.source,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to reach the assistant right now. Please check our standard FAQ or Rail Madad 139.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">RailSathi AI Journey Assistant</h3>
              <p className="text-[11px] text-slate-300">
                Grounded in verified railway records & IRCTC regulations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Feed */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] p-3 rounded-xl whitespace-pre-line leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {m.text}
                {m.source && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Source: {m.source}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Checking Indian Railways knowledge base...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-3 bg-white border-t border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Suggested Inquiries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(prompt);
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about your train, PNR, luggage, or refund policy..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Loader } from 'lucide-react';
import { useAgent } from '../hooks/useAgent';
import useAppStore from '../store/useAppStore';

export default function AIChat() {
  const [input, setInput] = useState('');
  const { sendMessage, isProcessing } = useAgent();
  const { chatMessages } = useAppStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto"
    >
      <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
          <div className="w-8 h-8 rounded-full bg-[#7c6ff7]/15 flex items-center justify-center">
            <Bot size={16} className="text-[#7c6ff7]" />
          </div>
          <div>
            <div className="text-white text-sm font-medium">AI Treasury Advisor</div>
            <div className="text-slate-500 text-xs">Powered by OnChain AI</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00c896] animate-pulse" />
            <span className="text-[#00c896] text-xs">Online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#7c6ff7]/10 flex items-center justify-center">
                <MessageSquare size={28} className="text-[#7c6ff7]" />
              </div>
              <div>
                <div className="text-white font-medium mb-1">Ask your AI Treasurer</div>
                <div className="text-slate-500 text-sm max-w-xs">
                  Get portfolio insights, yield optimization tips, and on-chain strategy advice.
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  'How can I maximize yield?',
                  'Should I rebalance now?',
                  'Analyze my gas spending',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.10] text-slate-300 text-xs hover:border-[#7c6ff7]/40 hover:text-[#7c6ff7] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#7c6ff7]/20' : 'bg-[#22263a]'}`}>
                {msg.role === 'user' ? (
                  <User size={14} className="text-[#7c6ff7]" />
                ) : (
                  <Bot size={14} className="text-slate-400" />
                )}
              </div>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#7c6ff7]/20 text-white rounded-tr-sm'
                    : 'bg-[#22263a] text-slate-200 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#22263a] flex items-center justify-center">
                <Bot size={14} className="text-slate-400" />
              </div>
              <div className="bg-[#22263a] px-4 py-3 rounded-xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-4 border-t border-white/[0.07]">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio, yields, strategies..."
              rows={1}
              className="flex-1 bg-[#22263a] border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#7c6ff7]/50 transition-colors scrollbar-thin"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="w-10 h-10 rounded-xl bg-[#7c6ff7] hover:bg-[#6b5fe6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isProcessing ? (
                <Loader size={16} className="text-white animate-spin" />
              ) : (
                <Send size={16} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, Loader2, Bot, User, MessageSquare } from 'lucide-react';

export default function AIAgent({ user, googleTokens, notionTokens }: any) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you manage your clients and onboarding today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = { role: 'assistant', content: `I've processed your request: "${input}". I can help you generate contracts, track onboarding steps, or analyze client data. What would you like to do next?` };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-[40px] border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-10 py-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">AI Assistant</h2>
            <p className="text-zinc-500 text-xs">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
          <Sparkles className="w-3 h-3" /> Online
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-6">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-zinc-100 text-zinc-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] p-5 rounded-[24px] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-zinc-900 text-white rounded-tr-none' 
                : 'bg-zinc-50 text-zinc-800 border border-zinc-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-zinc-50 p-5 rounded-[24px] rounded-tl-none border border-zinc-100">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-zinc-100 bg-zinc-50/30">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your clients..."
            className="w-full px-8 py-5 bg-white border border-zinc-200 rounded-[28px] pr-16 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all font-medium text-zinc-900"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-3 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

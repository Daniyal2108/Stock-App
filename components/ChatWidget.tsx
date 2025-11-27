import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Star, Gift, Share2, Download, Briefcase } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { chatWithAnalyst } from '../services/geminiService';

interface ChatWidgetProps {
  chatCount: number;
  incrementChat: () => void;
  user: UserProfile | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ chatCount, incrementChat, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hello ${user?.name?.split(' ')[0] || 'Trader'}! I am DK, your personal Financial Advisor. I see your profile is set to '${user?.riskTolerance || 'General'}'. How can I help optimize your strategy today?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatCount > 0 && chatCount % 15 === 0) {
      setShowPromo(true);
    }
  }, [chatCount]);

  // Reset welcome message if user logs in
  useEffect(() => {
    if (user) {
        setMessages([{ id: '1', role: 'model', text: `Welcome back, ${user.name}. I'm ready to assist with your ${user.goal} goals. What's on your mind?`, timestamp: new Date() }]);
    }
  }, [user]);

  const handleSend = async () => {
    if (!input.trim()) return;

    incrementChat();
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Format history for Gemini
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    // Pass User Context to Service
    const responseText = await chatWithAnalyst(history, userMsg.text, user);
    
    setIsTyping(false);
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
  };

  return (
    <>
      {/* Promo Modal */}
      {showPromo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-market-card border border-amber-500 rounded-2xl p-6 max-w-md w-full relative animate-bounce-in">
             <button onClick={() => setShowPromo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
             <div className="flex flex-col items-center text-center">
                <Gift className="text-amber-500 w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Exclusive Offer Unlocked!</h2>
                <p className="text-slate-300 mb-4">You've hit 15 chats! Share this tool with 5 friends and email screenshots to <span className="text-market-accent">dk@vinncorp.com</span> to join the exclusive investors club.</p>
                <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-6 rounded-full flex items-center gap-2">
                   <Share2 size={18} /> Share Now
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-market-accent hover:bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110 z-40 flex items-center gap-2 group"
      >
        <div className="relative">
          <Briefcase size={isOpen ? 20 : 24} className="group-hover:hidden" />
          <MessageCircle size={isOpen ? 20 : 24} className="hidden group-hover:block" />
        </div>
        <span className="font-semibold hidden sm:inline text-sm sm:text-base">DK Advisor</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-[90vw] md:w-[400px] h-[calc(100vh-6rem)] sm:h-[500px] max-h-[600px] bg-market-card border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-market-accent/20 p-2 rounded-lg">
                <Briefcase className="text-market-accent" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">DK Financial Advisor</h3>
                <p className="text-xs text-slate-400">Personalized Strategy • Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-market-dark/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-market-accent text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-slate-800 text-slate-400 rounded-2xl p-3 text-xs italic border border-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                    Analysing market...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-900 border-t border-slate-700">
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Ask about market analysis..."
                 className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-market-accent outline-none"
               />
               <button onClick={handleSend} className="bg-market-accent p-2 rounded-lg text-white hover:bg-blue-600 transition-colors">
                 <Send size={18} />
               </button>
             </div>
             <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-slate-500">AI predictions may vary. Not legal financial advice.</span>
                <div className="flex gap-2 text-slate-500">
                    <span title="Export Chat" className="cursor-pointer hover:text-white">
                        <Download size={14} />
                    </span>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
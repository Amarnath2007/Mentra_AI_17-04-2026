import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import { useSocket } from '../../lib/socket';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getMentors, getChatHistory } from '../../lib/api';
import { Send, User, Search, Paperclip, Smile, MoreHorizontal, Check, CheckCheck, MessageSquare, Wifi, WifiOff, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudentMentorChat() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('mentra_token') : null;
  const { socket, connected, sendMessage: socketSend, onEvent, offEvent } = useSocket(token);

  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user) fetchMentors();
  }, [user, authLoading]);

  useEffect(() => {
    if (!socket || !selectedMentor) return;

    // Join DM Room
    const dmRoom = [user.id, selectedMentor.id].sort().join('__dm__');
    socket.emit('room:join', { room: dmRoom });
    setRoom(dmRoom);
    loadHistory(dmRoom);

    const handleMessage = (msg) => {
      if (msg.room === dmRoom) {
        setMessages(prev => {
          // Check for existing message (by ID or optimistic match)
          const isDuplicate = prev.some(m => 
            m.id === msg.id || 
            (m.optimistic && m.content === msg.content && (m.sender?.id === (msg.sender?.id || msg.sender)))
          );
          if (isDuplicate) {
             return prev.map(m => (m.optimistic && m.content === msg.content) ? { ...msg, optimistic: false } : m);
          }
          return [...prev, msg];
        });
      }
    };

    const handleTypingStart = (data) => {
      if (data.room === dmRoom && data.user !== user.name) setTyping(true);
    };

    const handleTypingStop = (data) => {
      if (data.room === dmRoom) setTyping(false);
    };

    onEvent('message', handleMessage);
    onEvent('typing:start', handleTypingStart);
    onEvent('typing:stop', handleTypingStop);

    return () => {
      socket.emit('room:leave', { room: dmRoom });
      offEvent('message', handleMessage);
      offEvent('typing:start', handleTypingStart);
      offEvent('typing:stop', handleTypingStop);
    };
  }, [socket, selectedMentor]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const fetchMentors = async () => {
    try {
      const res = await getMentors();
      setMentors(res.data);
      if (res.data.length > 0) setSelectedMentor(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch mentors', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (roomId) => {
    try {
      const res = await getChatHistory(roomId);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load history', err);
      setMessages([]);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !room) return;

    socketSend(room, inputText.trim());
    setInputText('');
    
    // Optimistic update
    const optimisticMsg = {
      id: Date.now(),
      room,
      content: inputText.trim(),
      sender: { id: user.id, name: user.name, role: user.role },
      senderName: user.name,
      senderRole: user.role,
      createdAt: new Date(),
      status: 'sent',
      optimistic: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (!socket || !room) return;
    socket.emit('typing:start', { room });
    
    if (window.typingTimeout) clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit('typing:stop', { room });
    }, 2000);
  };

  if (authLoading || !user) return null;

  return (
    <DashboardLayout title="Chat with Mentor">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-160px)] gap-6 animate-fade-in">
        
        {/* Sidebar: Mentor List */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
           <Link href="/dashboard" className="flex items-center gap-2 text-xs font-700 text-slate-500 dark:text-slate-400 hover:text-[#0A66C2] transition-colors mb-2">
              <ChevronLeft size={14} /> Back to Dashboard
           </Link>
           
           <div className="glass rounded-2xl flex flex-col overflow-hidden flex-1 border border-slate-100 dark:border-slate-700">
              <div className="p-5 border-b border-slate-50">
                 <h3 className="text-sm font-700 text-slate-800 dark:text-slate-100" style={{ fontWeight: 700 }}>Your Mentors</h3>
                 <p className="text-[10px] text-slate-400 font-500 uppercase tracking-widest mt-1">Available for DM</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                 {loading ? (
                    [1,2].map(i => <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse m-2" />)
                 ) : mentors.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setSelectedMentor(m)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedMentor?.id === m.id ? 'bg-[#0A66C2]/10 text-[#0A66C2]' : 'hover:bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                       <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-700 text-[#0A66C2] flex-shrink-0 shadow-sm">
                          {m.name[0]}
                       </div>
                       <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-600 truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">Senior Mentor</p>
                       </div>
                    </button>
                 ))}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                 <div className={`flex items-center gap-2 text-[10px] font-800 uppercase tracking-widest ${connected ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-50 dark:bg-emerald-900/200 animate-pulse' : 'bg-slate-300'}`} />
                    {connected ? 'Live Sync Active' : 'Offline Mode'}
                 </div>
              </div>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass rounded-[32px] border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm relative">
          {selectedMentor ? (
            <>
              {/* Chat Header */}
              <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white dark:bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white font-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                    {selectedMentor.name[0]}
                  </div>
                  <div>
                    <p className="text-base font-700 text-slate-800 dark:text-slate-100" style={{ fontWeight: 700 }}>{selectedMentor.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/200" />
                       <p className="text-[10px] text-emerald-600 font-700 uppercase tracking-widest">Available to help</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button className="p-2.5 text-slate-400 hover:text-[#0A66C2] hover:bg-white dark:bg-slate-900 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:border-slate-700">
                      <Sparkles size={18} />
                   </button>
                   <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-white dark:bg-slate-900 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:border-slate-700">
                      <MoreHorizontal size={18} />
                   </button>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                     <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                        <MessageSquare size={32} />
                     </div>
                     <p className="text-sm font-500 text-slate-400 max-w-[200px]">Send a message to start your mentoring session.</p>
                  </div>
                ) : messages.map((msg, i) => {
                  const isSelf = msg.sender.id === user.id || msg.sender === user.id;
                  return (
                    <div key={msg.id || i} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                      <div className={`max-w-[75%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm font-500 leading-relaxed ${
                          isSelf 
                          ? 'bg-[#0A66C2] text-white rounded-br-none shadow-lg shadow-blue-900/10' 
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-[10px] text-slate-400 font-600 uppercase tracking-widest">
                            {new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isSelf && (
                             <Check size={10} className={msg.optimistic ? 'text-slate-200' : 'text-emerald-400'} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-4 py-2 rounded-2xl flex gap-1 items-center shadow-sm">
                       <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                       <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 bg-white dark:bg-slate-900/50 border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-2 pl-5 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#0A66C2]/5 focus-within:border-[#0A66C2] transition-all">
                  <textarea 
                    rows="1"
                    className="flex-1 py-3 text-sm text-slate-800 dark:text-slate-100 font-500 outline-none resize-none bg-transparent placeholder:text-slate-400"
                    placeholder="Type a message to your mentor..."
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <div className="flex items-center gap-1.5 pb-1">
                     <button type="button" className="p-2.5 text-slate-400 hover:text-[#0A66C2] transition-colors"><Smile size={20} /></button>
                     <button 
                       type="submit" 
                       disabled={!inputText.trim()}
                       className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${inputText.trim() ? 'bg-[#0A66C2] text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 cursor-default'}`}
                     >
                        <Send size={18} />
                     </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/30">
               <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 mb-4">
                  <User size={40} className="text-slate-200" />
               </div>
               <p className="text-sm font-700 tracking-wide">Select a mentor to chat</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </DashboardLayout>
  );
}

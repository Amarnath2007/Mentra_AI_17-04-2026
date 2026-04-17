import { useState, useEffect, useRef } from 'react';
import MentorLayout from '../../components/mentor/MentorLayout';
import { useAuth } from '../../lib/auth';
import { useSocket } from '../../lib/socket';
import { getMentorStudents, getChatHistory } from '../../lib/api';
import { Send, User, Search, Paperclip, Smile, MoreHorizontal, Check, CheckCheck, MessageCircle, Wifi, WifiOff } from 'lucide-react';

export default function MentorChat() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('mentra_token') : null;
  const { socket, connected, sendMessage: socketSend, onEvent, offEvent } = useSocket(token);

  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState(false);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!socket || !selectedContact) return;

    // Join DM Room
    const dmRoom = [user.id, selectedContact.id].sort().join('__dm__');
    socket.emit('room:join', { room: dmRoom });
    setRoom(dmRoom);
    loadHistory(dmRoom);

    const handleMessage = (msg) => {
      if (msg.room === dmRoom) {
        setMessages(prev => {
          // Check if we already have this message (either by ID or optimistic match)
          const isDuplicate = prev.some(m => 
            m.id === msg.id || 
            (m.optimistic && m.content === msg.content && (m.sender?.id === (msg.sender?.id || msg.sender)))
          );
          if (isDuplicate) {
            // Replace optimistic message with the real one from server
            return prev.map(m => 
              (m.optimistic && m.content === msg.content) ? { ...msg, optimistic: false } : m
            );
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
  }, [socket, selectedContact]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const fetchStudents = async () => {
    try {
      const res = await getMentorStudents();
      setStudents(res.data);
      if (res.data.length > 0) setSelectedContact(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch students', err);
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

  const filteredContacts = students.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MentorLayout title="Messages">
      <div className="h-[calc(100vh-160px)] flex bg-[#F9FAFB] rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm animate-fade-in">
        
        {/* Sidebar: Contacts */}
        <div className="w-80 border-r border-[#E5E7EB] bg-white flex flex-col">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-800 text-[#111827] uppercase tracking-widest">Active Chats</h3>
               <div className={`flex items-center gap-1.5 text-[10px] font-700 uppercase tracking-wider ${connected ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {connected ? 'Live' : 'Offline'}
               </div>
            </div>
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0A66C2] transition-colors" />
              <input 
                type="text" 
                placeholder="Search students..."
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl py-2.5 pl-10 pr-4 text-xs font-500 focus:outline-none focus:border-[#0A66C2] transition-colors"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto translate-z-0 custom-scrollbar">
            {loading ? (
               [1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 m-4 rounded-xl animate-pulse" />)
            ) : filteredContacts.map((contact) => (
              <button 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-4 px-6 py-5 border-b border-transparent transition-all relative ${selectedContact?.id === contact.id ? 'bg-[#0A66C2]/5' : 'hover:bg-[#F9FAFB]'}`}
              >
                {selectedContact?.id === contact.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0A66C2]" />}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0A66C2] font-700 text-sm border border-[#E5E7EB]">
                    {contact.name[0]}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-sm font-700 truncate ${selectedContact?.id === contact.id ? 'text-[#0A66C2]' : 'text-[#111827]'}`}>{contact.name}</p>
                  <p className="text-xs text-slate-500 truncate font-500">{contact.experience_level || 'Student'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-[#E5E7EB] flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#0A66C2] font-700">
                    {selectedContact.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-700 text-[#111827]">{selectedContact.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       <p className="text-[10px] text-emerald-600 font-700 uppercase tracking-widest">Active Now</p>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-xl transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Messages List */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-6 bg-white custom-scrollbar"
                style={{ backgroundImage: 'radial-gradient(#E5E7EB 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
              >
                {messages.map((msg, i) => {
                  const isMentor = (msg.senderRole === 'mentor' || msg.sender?.role === 'mentor');
                  return (
                    <div key={msg.id || i} className={`flex ${isMentor ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] group`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm font-500 leading-relaxed shadow-sm ${
                          isMentor 
                          ? 'bg-[#0A66C2] text-white rounded-br-none' 
                          : 'bg-[#F3F4F6] text-[#111827] rounded-bl-none border border-slate-100'
                        }`}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-2 mt-1.5 ${isMentor ? 'justify-end' : 'justify-start'}`}>
                          <p className="text-[10px] text-slate-400 font-600 uppercase tracking-wider">{new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          {isMentor && <Check size={12} className={msg.optimistic ? 'text-white/40' : 'text-emerald-400'} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="px-4 py-3 rounded-2xl bg-[#F3F4F6] text-slate-400 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-[#E5E7EB] bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-2 px-4 focus-within:border-[#0A66C2] transition-colors">
                  <button type="button" className="p-2 text-slate-400 hover:text-[#0A66C2] transition-colors"><Smile size={20} /></button>
                  <button type="button" className="p-2 text-slate-400 hover:text-[#0A66C2] transition-colors"><Paperclip size={20} /></button>
                  <textarea 
                    rows="1"
                    className="flex-1 bg-transparent py-2.5 px-2 text-sm text-[#111827] font-500 focus:outline-none resize-none placeholder:text-slate-400"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className={`p-2.5 rounded-xl transition-all ${inputText.trim() ? 'bg-[#0A66C2] text-white shadow-lg shadow-blue-200' : 'bg-[#E5E7EB] text-white cursor-default'}`}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-[#F9FAFB] flex items-center justify-center">
                <MessageCircle size={40} className="opacity-20" />
              </div>
              <p className="text-sm font-600 uppercase tracking-widest text-slate-400">Select a student to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </MentorLayout>
  );
}

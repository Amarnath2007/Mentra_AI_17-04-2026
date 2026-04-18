import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSocket } from '../../lib/socket';
import { getChatHistory, getChatRooms } from '../../lib/api';
import { Send, Hash, Wifi, WifiOff, Users, MessageSquare } from 'lucide-react';

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const roleColor = (role) => role === 'mentor' ? '#c084fc' : '#3b82f6';

export default function Chat() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('mentra_token') : null;
  const { socket, connected, joinRoom, leaveRoom, sendMessage: socketSend, onEvent, offEvent } = useSocket(token);

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { loadRooms(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setMessages(prev => {
        // Prevent double message by checking optimistic ones
        if (prev.some(m => m.id === msg.id || (m.optimistic && m.content === msg.content && m.sender.id === (msg.sender.id || msg.sender)))) {
           return prev.map(m => (m.optimistic && m.content === msg.content) ? { ...msg, optimistic: false } : m);
        }
        return [...prev, msg];
      });
    };
    const typStart = ({ user: u }) => setTyping(prev => prev.includes(u) ? prev : [...prev, u]);
    const typStop = ({ user: u }) => setTyping(prev => prev.filter(x => x !== u));

    onEvent('message', handler);
    onEvent('typing:start', typStart);
    onEvent('typing:stop', typStop);
    return () => {
      offEvent('message', handler);
      offEvent('typing:start', typStart);
      offEvent('typing:stop', typStop);
    };
  }, [socket]);

  const loadRooms = async () => {
    try {
      const res = await getChatRooms();
      setRooms(res.data);
      if (res.data.length > 0) switchRoom(res.data[0]);
    } catch (e) {
      const fallback = [
        { id: 'general', name: 'General', icon: '💬', members: 128 },
        { id: 'javascript', name: 'JavaScript', icon: '⚡', members: 94 },
        { id: 'python', name: 'Python', icon: '🐍', members: 76 },
      ];
      setRooms(fallback);
      switchRoom(fallback[0]);
    }
  };

  const switchRoom = async (room) => {
    if (activeRoom) leaveRoom(activeRoom.id);
    setActiveRoom(room);
    setMessages([]);
    setLoadingHistory(true);
    joinRoom(room.id);
    try {
      const res = await getChatHistory(room.id);
      setMessages(res.data || []);
    } catch(e) {
      // Start fresh
      setMessages([{ id: 'sys', type: 'system', content: `Welcome to #${room.name}! Start the conversation.`, senderName: 'System', createdAt: new Date() }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !activeRoom) return;
    const content = input.trim();
    setInput('');
    // Optimistic update
    const optimistic = {
      id: Date.now().toString(),
      room: activeRoom.id,
      sender: { id: user.id, name: user.name, role: user.role },
      senderName: user.name,
      senderRole: user.role,
      content,
      createdAt: new Date(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    socketSend(activeRoom.id, content);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket || !activeRoom) return;
    socket.emit('typing:start', { room: activeRoom.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing:stop', { room: activeRoom.id }), 1500);
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout title="Chat">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-150px)] gap-4">

        {/* Room sidebar */}
        <div className="w-64 flex-shrink-0 glass rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4" style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-600 text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <MessageSquare size={15} style={{ color: '#2563eb' }} /> Rooms
              </h3>
              <div className={`flex items-center gap-1 text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
                <span>{connected ? 'Live' : 'Off'}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rooms.map(room => (
              <button key={room.id} onClick={() => switchRoom(room)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${activeRoom?.id === room.id ? 'nav-active' : 'hover:bg-white/5 text-gray-400'}`}>
                <span className="text-base flex-shrink-0">{room.icon || '#'}</span>
                <div className="min-w-0">
                  <p className="font-500 truncate text-slate-800 dark:text-slate-200" style={{ fontWeight: 500 }}>{room.name}</p>
                  {room.members && <p className="text-xs text-slate-500 dark:text-slate-400">{room.members} members</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden min-w-0">
          {/* Room header */}
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{activeRoom?.icon || '#'}</span>
              <div>
                <p className="font-600 text-sm text-slate-800 dark:text-white" style={{ fontWeight: 600 }}>{activeRoom?.name || 'Select a room'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeRoom?.description || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Users size={12} />
              <span>{activeRoom?.members || 0}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-2 items-center text-sm" style={{ color: '#94a3b8' }}>
                  <div className="w-4 h-4 rounded-full border-2 border-t-brand-500 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.3)', borderTopColor: '#2563eb' }} />
                  Loading messages...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-3">{activeRoom?.icon || '💬'}</div>
                <p className="text-sm font-500" style={{ fontWeight: 500 }}>No messages yet</p>
                <p className="text-xs mt-1 text-slate-400">Be the first to say something!</p>
              </div>
            ) : messages.map((msg, i) => {
              if (msg.type === 'system') return (
                <div key={msg.id || i} className="text-center text-xs py-1" style={{ color: '#94a3b8' }}>{msg.content}</div>
              );

              const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
              const isSelf = senderId === user.id || msg.senderName === user.name;

              return (
                <div key={msg.id || i} className={`flex gap-2.5 ${isSelf ? 'flex-row-reverse' : ''} animate-fade-in`}>
                  {/* Avatar */}
                  {!isSelf && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0 mt-1"
                      style={{ background: 'linear-gradient(135deg,#1a1a3e,#2a2a5a)', border: `1px solid ${roleColor(msg.senderRole)}30`, fontWeight: 700 }}>
                      {getInitials(msg.senderName)}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isSelf && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-500" style={{ color: roleColor(msg.senderRole), fontWeight: 500 }}>{msg.senderName}</span>
                        {msg.senderRole === 'mentor' && <span className="badge badge-mentor" style={{ fontSize: 9, padding: '1px 6px' }}>mentor</span>}
                      </div>
                    )}
                    <div className={`px-3.5 py-2 text-sm ${isSelf ? 'msg-self' : 'msg-other'} ${msg.optimistic ? 'opacity-70' : ''}`}
                      style={{ color: 'rgba(240,240,255,0.92)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                    <span className="text-xs mt-1 text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typing.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex gap-0.5">
                  {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full animate-bounce" style={{ background: '#3b82f6', animationDelay: `${i*0.15}s` }} />)}
                </div>
                {typing[0]} is typing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <div className="flex gap-2 items-center">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-400"><Hash size={14} /></span>
                <input value={input} onChange={handleTyping}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Message #${activeRoom?.name || 'general'}...`}
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100"
                  style={{ fontFamily: 'DM Sans,sans-serif' }}
                />
              </div>
              <button onClick={handleSend} disabled={!input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: input.trim() ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : 'rgba(37,99,235,0.15)', cursor: input.trim() ? 'pointer' : 'not-allowed' }}>
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

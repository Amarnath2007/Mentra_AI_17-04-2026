import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSocket } from '../../lib/socket';
import {
  getCommunities, getMyCommunities, createCommunity, joinCommunity,
  leaveCommunity, getCommunityMessages
} from '../../lib/api';
import {
  Send, Hash, Wifi, WifiOff, Users, MessageSquare, Plus, Search,
  X, ChevronRight, Sparkles, LogOut, Crown, Rocket
} from 'lucide-react';

const TOPIC_ICONS = {
  General: '💬', Tech: '💻', Design: '🎨', Business: '📈',
  AI: '🤖', Career: '🚀', Science: '🔬', Gaming: '🎮', Music: '🎵', Other: '✨',
};
const TOPIC_OPTIONS = Object.keys(TOPIC_ICONS);

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Create Community Modal ─────────────────────────────────────────────────
const CreateModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('General');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Community name is required');
    setCreating(true);
    setError('');
    try {
      const res = await createCommunity({ name: name.trim(), description: description.trim(), topic, icon: TOPIC_ICONS[topic] || '💬' });
      onCreate(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-700" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Start a Community</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-slate-500 mb-1.5 uppercase tracking-wider">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frontend Devs"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-600 text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this community about?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none bg-slate-50" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-600 text-slate-500 mb-1.5 uppercase tracking-wider">Topic</label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_OPTIONS.map(t => (
                <button key={t} onClick={() => setTopic(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-500 transition-all border"
                  style={{
                    background: topic === t ? 'rgba(37,99,235,0.1)' : '#f8fafc',
                    borderColor: topic === t ? '#3b82f6' : '#e2e8f0',
                    color: topic === t ? '#2563eb' : '#64748b',
                    fontWeight: topic === t ? 600 : 400,
                  }}>
                  {TOPIC_ICONS[t]} {t}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-500">{error}</p>}

          <button onClick={handleCreate} disabled={creating || !name.trim()}
            className="w-full py-3 rounded-xl text-sm font-600 text-white transition-all flex items-center justify-center gap-2"
            style={{ background: creating || !name.trim() ? '#94a3b8' : 'linear-gradient(135deg,#1d4ed8,#2563eb)', cursor: creating || !name.trim() ? 'not-allowed' : 'pointer' }}>
            {creating ? 'Creating...' : <><Sparkles size={15} /> Create Community</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Community Card ─────────────────────────────────────────────────────────
const CommunityCard = ({ community, isJoined, onJoin, onSelect }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all group cursor-pointer"
    onClick={() => isJoined ? onSelect(community) : null}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm"
        style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
        {community.icon || TOPIC_ICONS[community.topic] || '💬'}
      </div>
      <span className="text-[10px] font-700 uppercase tracking-widest px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(37,99,235,0.08)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.15)' }}>
        {community.topic || 'General'}
      </span>
    </div>
    <h4 className="text-sm font-700 text-slate-800 mb-1 group-hover:text-blue-600 transition-colors" style={{ fontWeight: 700 }}>{community.name}</h4>
    <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{community.description || 'No description yet.'}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={12} /> {community.member_count || 0} members</span>
      {isJoined ? (
        <button onClick={(e) => { e.stopPropagation(); onSelect(community); }}
          className="text-xs font-600 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-1">
          Open <ChevronRight size={12} />
        </button>
      ) : (
        <button onClick={(e) => { e.stopPropagation(); onJoin(community.id); }}
          className="text-xs font-600 px-3 py-1.5 rounded-lg text-white transition-all flex items-center gap-1"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
          <Plus size={12} /> Join
        </button>
      )}
    </div>
  </div>
);

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function CommunityChat() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('mentra_token') : null;
  const { socket, connected, onEvent, offEvent } = useSocket(token);

  // State
  const [view, setView] = useState('list'); // 'list' or 'chat'
  const [communities, setCommunities] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  // Load communities
  useEffect(() => { if (user) loadCommunities(); }, [user]);

  // Realtime messages
  useEffect(() => {
    if (!socket || !activeCommunity) return;
    const handler = (msg) => {
      if (msg.community_id === activeCommunity.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };
    onEvent('community:message', handler);
    return () => offEvent('community:message', handler);
  }, [socket, activeCommunity]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadCommunities = async () => {
    setLoadingList(true);
    try {
      const [allRes, myRes] = await Promise.all([
        getCommunities(search),
        getMyCommunities()
      ]);
      setCommunities(allRes.data || []);
      setJoinedIds(new Set((myRes.data || []).map(c => c.id)));
    } catch (e) {
      console.error('load communities error:', e);
    } finally {
      setLoadingList(false);
    }
  };

  // Search debounce
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => loadCommunities(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleJoin = async (communityId) => {
    try {
      await joinCommunity(communityId);
      setJoinedIds(prev => new Set([...prev, communityId]));
      loadCommunities();
    } catch (e) {
      alert('Failed to join community');
    }
  };

  const selectCommunity = async (community) => {
    setActiveCommunity(community);
    setView('chat');
    setLoadingMsgs(true);
    setMessages([]);

    // Join socket room
    socket?.emit('community:join', { communityId: community.id });

    try {
      const res = await getCommunityMessages(community.id);
      setMessages(res.data || []);
    } catch (e) {
      console.error('load messages error:', e);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleBack = () => {
    if (activeCommunity) {
      socket?.emit('community:leave', { communityId: activeCommunity.id });
    }
    setActiveCommunity(null);
    setView('list');
    setMessages([]);
  };

  const handleSend = () => {
    if (!input.trim() || !activeCommunity) return;
    const content = input.trim();
    setInput('');

    // Optimistic update
    const optimistic = {
      id: `opt_${Date.now()}`,
      community_id: activeCommunity.id,
      user_id: user.id,
      user_name: user.name,
      content,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    // Send via socket for realtime
    socket?.emit('community:send', { communityId: activeCommunity.id, content });
  };

  const handleLeave = async () => {
    if (!activeCommunity) return;
    try {
      await leaveCommunity(activeCommunity.id);
      socket?.emit('community:leave', { communityId: activeCommunity.id });
      setJoinedIds(prev => { const n = new Set(prev); n.delete(activeCommunity.id); return n; });
      handleBack();
      loadCommunities();
    } catch(e) {}
  };

  const handleCreate = (newCommunity) => {
    setJoinedIds(prev => new Set([...prev, newCommunity.id]));
    loadCommunities();
    selectCommunity(newCommunity);
  };

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
  if (loading || !user) return null;

  // ─── CHAT VIEW ─────────────────────────────────────────────────────────
  if (view === 'chat' && activeCommunity) {
    return (
      <DashboardLayout title="Community Chat">
        <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-fade-in">
          {/* Chat Header */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                <ChevronRight size={18} className="rotate-180" />
              </button>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                {activeCommunity.icon || '💬'}
              </div>
              <div>
                <p className="font-600 text-sm text-slate-800 dark:text-white" style={{ fontWeight: 600 }}>{activeRoom?.name || 'Select a room'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeRoom?.description || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Users size={12} />
              <span>{activeRoom?.members || 0}</span>
            </div>
                <p className="font-700 text-sm text-slate-800" style={{ fontWeight: 700 }}>{activeCommunity.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={10} /> {activeCommunity.member_count}</span>
                  <div className={`flex items-center gap-1 text-xs ${connected ? 'text-green-500' : 'text-red-400'}`}>
                    {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                    <span>{connected ? 'Live' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleLeave}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 border border-red-100 transition-all font-500">
              <LogOut size={12} /> Leave
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 mb-3">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-2 items-center text-sm text-slate-400">
                  <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
                  Loading messages...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-5xl mb-4">{activeCommunity.icon || '💬'}</div>
                <p className="text-sm font-600 text-slate-600 mb-1" style={{ fontWeight: 600 }}>No messages yet</p>
                <p className="text-xs text-slate-400">Be the first to say something! 🚀</p>
              </div>
            ) : messages.map((msg, i) => {
              const isSelf = msg.user_id === user.id;
              return (
                <div key={msg.id || i} className={`flex gap-2.5 ${isSelf ? 'flex-row-reverse' : ''} animate-fade-in`}>
                  {!isSelf && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-700 flex-shrink-0 mt-1 text-white"
                      style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', fontWeight: 700 }}>
                      {getInitials(msg.user_name)}
                    </div>
                  )}
                  <div className={`max-w-[75%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                    {!isSelf && (
                      <span className="text-[11px] font-600 text-blue-500 mb-0.5" style={{ fontWeight: 600 }}>{msg.user_name}</span>
                    )}
                    <div className={`px-3.5 py-2.5 text-sm rounded-2xl ${msg.optimistic ? 'opacity-60' : ''}`}
                      style={{
                        background: isSelf ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#f1f5f9',
                        color: isSelf ? '#fff' : '#334155',
                        borderBottomRightRadius: isSelf ? 4 : 16,
                        borderBottomLeftRadius: isSelf ? 16 : 4,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] mt-1 text-slate-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex gap-2 items-center">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Hash size={14} className="text-slate-400" />
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message #${activeCommunity.name}...`}
                className="flex-1 bg-transparent outline-none text-sm text-slate-800" style={{ fontFamily: 'DM Sans,sans-serif' }} />
            </div>
            <button onClick={handleSend} disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm"
              style={{ background: input.trim() ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#e2e8f0', cursor: input.trim() ? 'pointer' : 'not-allowed' }}>
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── COMMUNITY LIST VIEW ──────────────────────────────────────────────
  const joinedCommunities = communities.filter(c => joinedIds.has(c.id));
  const discoverCommunities = communities.filter(c => !joinedIds.has(c.id));

  return (
    <DashboardLayout title="Community">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-700" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Communities</h2>
            <p className="text-sm text-slate-500 mt-1">Join communities, learn together, and chat in real-time.</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', fontWeight: 600 }}>
            <Plus size={16} /> Start Community
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search communities by name or topic..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-2 items-center text-sm text-slate-400">
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
              Loading communities...
            </div>
          </div>
        ) : communities.length === 0 && !search ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">👀</div>
            <h3 className="text-xl font-700 text-slate-800 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>No communities yet</h3>
            <p className="text-sm text-slate-500 mb-6">Be the first to start one 🚀</p>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-600 text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
              <Plus size={16} /> Create First Community
            </button>
          </div>
        ) : (
          <>
            {/* My Communities */}
            {joinedCommunities.length > 0 && (
              <div>
                <h3 className="text-sm font-700 text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                  <Crown size={14} className="text-amber-500" /> My Communities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {joinedCommunities.map(c => (
                    <CommunityCard key={c.id} community={c} isJoined={true} onJoin={handleJoin} onSelect={selectCommunity} />
                  ))}
                </div>
              </div>
            )}

            {/* Discover */}
            {discoverCommunities.length > 0 && (
              <div>
                <h3 className="text-sm font-700 text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                  <Rocket size={14} className="text-blue-500" /> Discover
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discoverCommunities.map(c => (
                    <CommunityCard key={c.id} community={c} isJoined={false} onJoin={handleJoin} onSelect={selectCommunity} />
                  ))}
                </div>
              </div>
            )}

            {/* Search with no results */}
            {search && communities.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <p className="text-sm text-slate-500">No communities match "<strong>{search}</strong>"</p>
                <button onClick={() => setShowCreate(true)}
                  className="mt-4 text-xs font-600 text-blue-600 hover:underline">
                  Create "{search}" community?
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      </div>
    </DashboardLayout>
  );
}

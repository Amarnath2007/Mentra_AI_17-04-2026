import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { mentorChat, getMentorChatHistory } from '../../lib/api';
import { Bot, Send, User, Sparkles, RefreshCw, Copy, Check, Lightbulb, MessageSquare } from 'lucide-react';

const QUICK_PROMPTS = [
  'What should I learn today?',
  'Give me a project idea',
  'Review my weak areas',
  'Suggest a study plan for this week',
  'Help me prepare for interviews',
  'Explain a concept I struggle with',
];

const MarkdownContent = ({ content }) => {
  const rendered = content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre style="background:#0f172a;border:1px solid rgba(37,99,235,0.2);border-radius:8px;padding:16px;overflow-x:auto;margin:8px 0"><code style="font-family:JetBrains Mono,monospace;font-size:13px;color:#e2e8f0">${code.trim().replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code style="background:rgba(37,99,235,0.15);padding:2px 6px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:0.85em;color:#1e40af">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0f172a;font-weight:700">$1</strong>')
    .replace(/\n/g, '<br/>');
  return <div dangerouslySetInnerHTML={{ __html: rendered }} style={{ lineHeight: 1.7 }} />;
};

const Typewriter = ({ text, onComplete, onUpdate }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.substring(0, i + 1));
        i++;
        if (onUpdate) onUpdate();
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 12);
    return () => clearInterval(timer);
  }, [text]);
  return <MarkdownContent content={displayed} />;
};

const Message = ({ msg, onTypingComplete, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'} animate-slide-up pb-2`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isAI ? 'glow-brand' : ''}`}
        style={{ background: isAI ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : 'linear-gradient(135deg,#f59e0b,#fb923c)', border: 'none' }}>
        {isAI ? <Bot size={15} className="text-white" /> : <User size={15} className="text-white" />}
      </div>
      <div className={`max-w-[80%] ${isAI ? '' : 'items-end'} flex flex-col gap-1`}>
        <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">{isAI ? 'Mentra AI Mentor' : 'You'}</p>
        <div className={`rounded-2xl px-4 py-3 text-sm ${isAI ? 'msg-other shadow-sm' : 'msg-self'}`}>
          {isAI ? (
            msg.isTyping ? <Typewriter text={msg.content} onComplete={onTypingComplete} onUpdate={onUpdate} /> : <MarkdownContent content={msg.content} />
          ) : <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
        </div>
        {isAI && (
          <button onClick={copy} className="flex items-center gap-1 text-xs transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-300 px-1">
            {copied ? <Check size={11} style={{ color: '#4ade80' }} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
};

export default function MentorChat() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => { 
    if (!loading && !user) router.push('/login'); 
    if (user && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${user.name}! 👋 I'm your personal AI mentor. I give **highly concise, actionable guidance**.\n\nWhat's on your mind?`,
        id: 'welcome'
      }]);
    }
  }, [user, loading]);
  
  useEffect(() => { scrollToBottom(); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loadingMsg) return;
    setInput('');
    setLoadingMsg(true);

    const userMsg = { role: 'user', content: msg, id: Date.now() };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '...', loading: true, id: 'loading' }]);

    try {
      const res = await mentorChat({ message: msg });
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), { role: 'assistant', content: res.data.reply, isTyping: true, id: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), {
        role: 'assistant',
        content: 'I encountered a connection issue. Please try again.',
        isTyping: true,
        id: Date.now()
      }]);
    } finally {
      setLoadingMsg(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: `Chat cleared! How can I help you, ${user?.name}?`, id: 'cleared' }]);
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout title="AI Mentor">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-brand" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="font-600 text-sm" style={{ fontWeight: 600 }}>Your AI Mentor</p>
              <div className="flex items-center gap-1.5">
                <div className="dot-online w-1.5 h-1.5" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Session Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 px-1 mb-4 scroll-smooth">
          {messages.map((msg, i) => (
            msg.loading ? (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 glow-brand" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                  <Bot size={15} className="text-white" />
                </div>
                <div className="msg-other rounded-2xl px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map(j => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#3b82f6', animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            ) : <Message key={msg.id || i} msg={msg} onUpdate={scrollToBottom} onTypingComplete={() => {
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isTyping: false } : m));
            }} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={13} style={{ color: '#f59e0b' }} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Quick actions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs py-1.5 px-3 rounded-full transition-all hover:opacity-80 bg-blue-50 text-blue-600 border border-blue-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="glass rounded-2xl p-3 flex gap-3 items-end">
          <textarea ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask your mentor anything..."
            className="flex-1 resize-none outline-none bg-transparent text-sm leading-relaxed text-slate-800 dark:text-slate-100"
            style={{ fontFamily: 'DM Sans,sans-serif', maxHeight: 120, minHeight: 24 }}
            rows={1}
          />
          <button onClick={() => send()} disabled={!input.trim() || loadingMsg}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: input.trim() && !loadingMsg ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : 'rgba(37,99,235,0.15)', cursor: input.trim() && !loadingMsg ? 'pointer' : 'not-allowed' }}>
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs mt-2 text-slate-400">
          Powered by AI · Personalized to your profile
        </p>
      </div>
    </DashboardLayout>
  );
}

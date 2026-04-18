import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { chatWithAI } from '../../lib/api';
import { Bot, Send, User, Sparkles, RefreshCw, Copy, Check, Lightbulb } from 'lucide-react';

const SUGGESTIONS = [
  'Explain React hooks with examples',
  'How does async/await work in JavaScript?',
  'What is system design and why does it matter?',
  'Explain the difference between SQL and NoSQL',
  'How do I get better at coding interviews?',
  'What is machine learning and how do I start?',
];

const MarkdownContent = ({ content }) => {
  // Simple markdown renderer
  const rendered = content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre style="background:#0d0d1a;border:1px solid rgba(37,99,235,0.2);border-radius:8px;padding:16px;overflow-x:auto;margin:8px 0"><code style="font-family:JetBrains Mono,monospace;font-size:13px;color:#e2e8f0">${code.trim().replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code style="background:rgba(37,99,235,0.15);padding:2px 6px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:0.85em;color:#1e40af">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0f172a;font-weight:700">$1</strong>')
    .replace(/\n/g, '<br/>');
  return <div dangerouslySetInnerHTML={{ __html: rendered }} style={{ lineHeight: 1.7 }} />;
};

const Typewriter = ({ text, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 15);
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return <MarkdownContent content={displayed} />;
};

const Message = ({ msg, onTypingComplete }) => {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'} animate-slide-up`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isAI ? 'glow-brand' : ''}`}
        style={{ background: isAI ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : 'linear-gradient(135deg,#1a1a3e,#2a2a5a)', border: isAI ? 'none' : '1px solid rgba(37,99,235,0.3)' }}>
        {isAI ? <Bot size={15} className="text-white" /> : <User size={15} style={{ color: '#3b82f6' }} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isAI ? '' : 'items-end'} flex flex-col gap-1`}>
        <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">
          {isAI ? 'Mentra AI' : 'You'}
        </p>
        <div className={`rounded-2xl px-4 py-3 text-sm ${isAI ? 'msg-other shadow-sm' : 'msg-self'}`}>
          {isAI ? (
            msg.isTyping ? <Typewriter text={msg.content} onComplete={onTypingComplete} /> : <MarkdownContent content={msg.content} />
          ) : <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
        </div>
        {isAI && (
          <button onClick={copy} className="flex items-center gap-1 text-xs transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-300">
            {copied ? <Check size={11} style={{ color: '#4ade80' }} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
};

export default function AIAssistant() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Mentra, your AI learning assistant 🎓\n\nI can help you understand programming concepts, debug code, explain topics, suggest resources, and guide your learning journey.\n\nWhat would you like to learn today?" }
  ]);
  const [input, setInput] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loadingMsg) return;
    setInput('');
    setLoadingMsg(true);

    const userMsg = { role: 'user', content: msg };
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '...', loading: true }]);

    try {
      const res = await chatWithAI({ message: msg, history });
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: res.data.reply, isTyping: true, id: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        content: 'I encountered a connection issue. Please check that the server is running and try again.',
        isTyping: true,
        id: Date.now()
      }]);
    } finally {
      setLoadingMsg(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared! How can I help you today?" }]);
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout title="AI Assistant">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-brand" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="font-600 text-sm" style={{ fontWeight: 600 }}>Mentra AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <div className="dot-online w-1.5 h-1.5" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Ready to help</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs btn-secondary py-1.5 px-3">
            <RefreshCw size={12} /> Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-5 px-1 mb-4">
          {messages.map((msg, i) => (
            msg.loading ? (
              <div key={i} className="flex gap-3">
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
            ) : <Message key={msg.id || i} msg={msg} onTypingComplete={() => {
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isTyping: false } : m));
            }} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={13} style={{ color: '#f59e0b' }} />
              <span className="text-xs text-slate-500 dark:text-slate-400">Try asking...</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs py-1.5 px-3 rounded-full transition-all hover:opacity-80 bg-brand-50 text-brand-500 border border-brand-200">
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
            placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
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
          Powered by OpenAI · Responses may vary
        </p>
      </div>
    </DashboardLayout>
  );
}

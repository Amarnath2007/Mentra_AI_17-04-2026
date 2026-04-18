import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'student') setForm({ email: 'student@mentra.ai', password: 'demo123' });
    else setForm({ email: 'mentor@mentra.ai', password: 'demo123' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      {/* Bg glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #1d4ed8 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #fb923c 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-700 gradient-text" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Mentra AI</span>
          </div>
          <h1 className="text-2xl font-700 mb-1 dark:text-white" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to continue learning</p>
        </div>

        {/* Demo buttons */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => fillDemo('student')} className="flex-1 py-2 rounded-lg text-xs font-500 transition-all text-brand-500 bg-brand-50 border border-brand-200">
            Demo: Student
          </button>
          <button onClick={() => fillDemo('mentor')} className="flex-1 py-2 rounded-lg text-xs font-500 transition-all text-purple-600 bg-purple-50 border border-purple-200">
            Demo: Mentor
          </button>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-500 mb-1.5 text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input type="email" className="input-field pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-500 mb-1.5 text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input type={showPw ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </div>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#3b82f6' }} className="font-500 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

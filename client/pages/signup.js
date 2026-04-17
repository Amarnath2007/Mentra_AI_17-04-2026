import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, AlertCircle, GraduationCap, Users } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #1d4ed8 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-700 gradient-text" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Mentra AI</span>
          </div>
          <h1 className="text-2xl font-700 mb-1" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Create your account</h1>
          <p className="text-sm text-slate-500">Start your personalized learning journey</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="mb-5">
            <label className="block text-sm font-500 mb-2 text-slate-700">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'student', label: 'Student', desc: 'I want to learn', icon: GraduationCap, color: '#2563eb' },
                { value: 'mentor', label: 'Mentor', desc: 'I want to teach', icon: Users, color: '#a78bfa' },
              ].map(({ value, label, desc, icon: Icon, color }) => (
                <button key={value} type="button" onClick={() => setForm(p => ({ ...p, role: value }))}
                  className="p-3 rounded-xl text-left transition-all border"
                  style={{
                    background: form.role === value ? `${color}15` : 'rgba(26,26,50,0.6)',
                    border: `1px solid ${form.role === value ? color + '50' : 'rgba(37,99,235,0.1)'}`,
                  }}>
                  <Icon size={18} style={{ color: form.role === value ? color : '#94a3b8', marginBottom: 4 }} />
                  <p className="text-sm font-600 mb-1" style={{ color: form.role === value ? color : '#334155' }}>{label}</p>
                  <p className="text-xs" style={{ color: form.role === value ? color : '#64748b' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-500 mb-1.5 text-slate-700">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input type="text" className="input-field pl-10" placeholder="Your full name"
                  value={form.name} onChange={set('name')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-500 mb-1.5 text-slate-700">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input type="email" className="input-field pl-10" placeholder="you@example.com"
                  value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-500 mb-1.5 text-slate-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input type={showPw ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="At least 6 characters"
                  value={form.password} onChange={set('password')} required minLength={6} />
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
                  Creating account...
                </div>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#3b82f6' }} className="font-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

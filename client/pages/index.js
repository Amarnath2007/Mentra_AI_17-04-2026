import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { Sparkles, Brain, MessageSquare, Trophy, ChevronRight, Zap, Users, BookOpen } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Learning Engine', desc: 'Get a personalized curriculum built around your goals, interests, and current skill level.', color: '#2563eb' },
  { icon: MessageSquare, title: 'Real-Time Chat', desc: 'Connect with mentors and peers in topic-based rooms and 1-on-1 sessions.', color: '#fb923c' },
  { icon: Trophy, title: 'Skill Tracking', desc: 'Watch your progress in real time with XP points, streaks, and completion milestones.', color: '#22c55e' },
  { icon: Zap, title: 'AI Quiz Generator', desc: 'Test your knowledge with adaptive quizzes generated instantly on any topic.', color: '#a78bfa' },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #1d4ed8 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -top-20 right-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #fb923c 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-700 gradient-text" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Mentra AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm py-2 px-4">Log in</Link>
          <Link href="/signup" className="btn-primary text-sm py-2 px-4">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-24 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: '#3b82f6' }}>
          <Sparkles size={14} />
          <span>AI-Powered Mentorship Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-800 leading-tight mb-6 max-w-4xl" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800 }}>
          Learn smarter with{' '}
          <span className="gradient-text">AI-powered</span>{' '}
          mentorship
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed text-slate-600">
          Mentra adapts to your learning style, connects you with expert mentors, and guides you through a personalized path to mastery.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup" className="btn-primary px-8 py-3.5 text-base glow-brand">
            Start learning for free <ChevronRight size={18} />
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3.5 text-base">
            Sign in <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8" style={{ borderTop: '1px solid rgba(37,99,235,0.1)' }}>
          {[['500+', 'Learning Paths'], ['200+', 'Expert Mentors'], ['10k+', 'Students'], ['98%', 'Satisfaction']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <p className="text-2xl font-700 gradient-text" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{val}</p>
              <p className="text-sm text-slate-500">{lbl}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-20" style={{ borderTop: '1px solid rgba(37,99,235,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-700 text-center mb-3" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Everything you need to excel</h2>
          <p className="text-center mb-12 text-slate-600">A complete learning ecosystem in one platform</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass rounded-2xl p-6 card-hover cursor-default">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-600 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-3xl" style={{ background: 'linear-gradient(135deg,rgba(61,69,229,0.2),rgba(37,99,235,0.1))', border: '1px solid rgba(37,99,235,0.2)' }}>
          <h2 className="text-3xl font-700 mb-4" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Ready to accelerate your learning?</h2>
          <p className="mb-8 text-slate-600">Join thousands of learners who are already using Mentra to reach their goals faster.</p>
          <Link href="/signup" className="btn-primary px-10 py-4 text-base glow-brand">
            Create free account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 text-center py-6 text-sm text-slate-400" style={{ borderTop: '1px solid rgba(37,99,235,0.08)' }}>
        © {new Date().getFullYear()} Mentra AI · Built for Hackathon
      </footer>
    </div>
  );
}

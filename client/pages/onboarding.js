import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import { submitOnboarding, generateAIProfile } from '../lib/api';
import { ChevronRight, ChevronLeft, Sparkles, Loader, CheckCircle, User, GraduationCap, Code, Briefcase, Heart, Target, Clock, Brain, Shield, AlertTriangle, Calendar } from 'lucide-react';

const STEPS = [
  { key: 'role', title: 'What describes you best?', icon: User, type: 'single', options: ['Student', 'Working Professional', 'Freelancer', 'Career Switcher', 'Entrepreneur', 'Hobbyist', 'Other'] },
  { key: 'education', title: 'What is your education level?', icon: GraduationCap, type: 'single', options: ['High School', 'Diploma / ITI', 'Undergraduate', 'Graduate (Bachelors)', 'Post Graduate (Masters)', 'PhD', 'Self-Taught', 'Other'] },
  { key: 'skills', title: 'Select your current skills', subtitle: 'Choose all that apply, or type your own', icon: Code, type: 'multi-custom', options: ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C/C++', 'HTML/CSS', 'SQL', 'Excel / Sheets', 'Communication', 'Public Speaking', 'Marketing', 'Graphic Design', 'Video Editing', 'Writing / Content', 'Data Analysis', 'Machine Learning', 'Project Management', 'Finance / Accounting', 'Sales', 'Photography', 'Music / Audio', 'Teaching', 'Research'] },
  { key: 'experience_level', title: 'What is your experience level?', icon: Briefcase, type: 'single', options: ['Complete Beginner', 'Beginner (< 1 year)', 'Intermediate (1-3 years)', 'Advanced (3-5 years)', 'Expert (5+ years)'] },
  { key: 'interests', title: 'What interests you most?', subtitle: 'Choose all that apply, or type your own', icon: Heart, type: 'multi-custom', options: ['Web Development', 'Mobile Development', 'AI / Machine Learning', 'Data Science', 'Cloud & DevOps', 'Cybersecurity', 'Game Development', 'Blockchain / Web3', 'UI/UX Design', 'Digital Marketing', 'Content Creation', 'Business & Entrepreneurship', 'Finance & Trading', 'Healthcare / Biotech', 'Education / Teaching', 'Music / Arts', 'Mechanical / Civil Engg', 'Electronics / IoT', 'Research & Academia'] },
  { key: 'goals', title: 'What is your primary career goal?', icon: Target, type: 'single', options: ['Land my first job', 'Switch to a new career', 'Get promoted / level up', 'Build my own startup', 'Freelance / consulting', 'Academic research', 'Learn a new skill for fun', 'Prepare for exams / certifications', 'Other'] },
  { key: 'time_commitment', title: 'How much time can you dedicate weekly?', icon: Clock, type: 'single', options: ['2-5 hours', '5-10 hours', '10-20 hours', '20-30 hours', '30+ hours (Full-time)'] },
  { key: 'learning_style', title: 'How do you learn best?', icon: Brain, type: 'single', options: ['Video tutorials', 'Reading documentation / articles', 'Hands-on projects', 'Interactive exercises', 'Mentorship / guided learning', 'Group study / discussions', 'Mix of everything'] },
  { key: 'strengths', title: 'What are your strengths?', icon: Shield, type: 'text', placeholder: 'e.g., Problem solving, quick learner, creative thinking, good with numbers, strong communication...' },
  { key: 'weaknesses', title: 'What areas do you struggle with?', icon: AlertTriangle, type: 'text', placeholder: 'e.g., Staying consistent, understanding theory, time management, public speaking...' },
  { key: 'target_timeline', title: 'What is your target timeline?', icon: Calendar, type: 'single', options: ['1-3 months', '3-6 months', '6-12 months', '1-2 years', 'No rush, long-term'] },
];

export default function Onboarding() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customInputs, setCustomInputs] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.onboarding_completed) router.push('/dashboard');
  }, [user, loading]);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleSelect = (value) => {
    if (current.type === 'multi-custom' || current.type === 'multi') {
      const existing = answers[current.key] || [];
      if (value === 'Other') return; // handled by custom input
      const updated = existing.includes(value)
        ? existing.filter(v => v !== value)
        : [...existing, value];
      setAnswers(prev => ({ ...prev, [current.key]: updated }));
    } else {
      if (value === 'Other') {
        setAnswers(prev => ({ ...prev, [current.key]: '' }));
        setCustomInputs(prev => ({ ...prev, [current.key]: true }));
        return;
      }
      setCustomInputs(prev => ({ ...prev, [current.key]: false }));
      setAnswers(prev => ({ ...prev, [current.key]: value }));
    }
  };

  const handleCustomInput = (e) => {
    setAnswers(prev => ({ ...prev, [current.key]: e.target.value }));
  };

  const handleCustomMultiAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const val = e.target.value.trim();
      const existing = answers[current.key] || [];
      if (!existing.includes(val)) {
        setAnswers(prev => ({ ...prev, [current.key]: [...existing, val] }));
      }
      e.target.value = '';
    }
  };

  const handleText = (e) => {
    setAnswers(prev => ({ ...prev, [current.key]: e.target.value }));
  };

  const isStepValid = () => {
    const val = answers[current.key];
    if (current.type === 'multi' || current.type === 'multi-custom') return val && val.length > 0;
    if (current.type === 'text') return val && val.trim().length > 0;
    return !!val && val.trim?.() !== '';
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setGenerating(true);
    try {
      const res = await submitOnboarding(answers);
      updateUser(res.data.user || { ...answers, onboarding_completed: true });
      await generateAIProfile(answers);
      setGenerated(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      console.error('Onboarding error:', err);
      updateUser({ ...answers, onboarding_completed: true });
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  if (loading || !user) return null;

  // Generating state
  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="glass rounded-2xl p-10 text-center max-w-md w-full">
          {generated ? (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center bg-green-50 border-2 border-green-200">
                <CheckCircle size={32} style={{ color: '#22c55e' }} />
              </div>
              <h2 className="text-2xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Profile Created!</h2>
              <p className="text-slate-500 text-sm">Your personalized AI learning profile is ready. Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center bg-blue-50 border-2 border-blue-200">
                <Loader size={32} className="animate-spin" style={{ color: '#2563eb' }} />
              </div>
              <h2 className="text-2xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Generating Your AI Profile</h2>
              <p className="text-slate-500 text-sm mb-6">Our AI is analyzing your responses to create a personalized learning roadmap...</p>
              <div className="space-y-2">
                {['Analyzing your skills & background', 'Identifying growth opportunities', 'Building your personalized roadmap', 'Preparing tailored recommendations'].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600 animate-fade-in" style={{ animationDelay: `${i * 0.5}s` }}>
                    <div className="w-4 h-4 rounded-full border-2 border-t-blue-500 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb', animationDelay: `${i * 0.3}s` }} />
                    {text}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const Icon = current.icon;
  const isOtherSelected = customInputs[current.key] && (current.type === 'single');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-700 text-lg" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mentra AI</span>
          </div>
          <span className="text-sm text-slate-500">{step + 1} of {STEPS.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-100">
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#1d4ed8,#3b82f6)' }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {/* Question icon and title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100">
              <Icon size={28} style={{ color: '#2563eb' }} />
            </div>
            <h2 className="text-2xl font-700 mb-1" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{current.title}</h2>
            {current.subtitle && <p className="text-sm text-slate-500">{current.subtitle}</p>}
            {current.type === 'multi' && !current.subtitle && <p className="text-sm text-slate-500">Select all that apply</p>}
          </div>

          {/* Single select options */}
          {current.type === 'single' && (
            <div className="space-y-3">
              {current.options.map(opt => {
                const selected = opt === 'Other' ? isOtherSelected : answers[current.key] === opt;
                return (
                  <button key={opt} onClick={() => handleSelect(opt)}
                    className="w-full text-left px-5 py-4 rounded-xl text-sm transition-all flex items-center gap-3"
                    style={{
                      background: selected ? 'rgba(37,99,235,0.08)' : 'white',
                      border: `1.5px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                      color: selected ? '#1d4ed8' : '#334155',
                      fontWeight: selected ? 600 : 400,
                    }}>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selected ? '#2563eb' : '#cbd5e1' }}>
                      {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    {opt}
                  </button>
                );
              })}
              {/* Custom input for "Other" */}
              {isOtherSelected && (
                <input
                  type="text"
                  autoFocus
                  value={answers[current.key] || ''}
                  onChange={handleCustomInput}
                  placeholder="Please specify..."
                  className="input-field mt-2"
                  style={{ fontSize: 14 }}
                />
              )}
            </div>
          )}

          {/* Multi select with custom input */}
          {(current.type === 'multi-custom' || current.type === 'multi') && (
            <div>
              <div className="flex flex-wrap gap-2.5 mb-4">
                {current.options.map(opt => {
                  const selected = (answers[current.key] || []).includes(opt);
                  return (
                    <button key={opt} onClick={() => handleSelect(opt)}
                      className="px-4 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        background: selected ? 'rgba(37,99,235,0.1)' : 'white',
                        border: `1.5px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                        color: selected ? '#1d4ed8' : '#64748b',
                        fontWeight: selected ? 600 : 400,
                      }}>
                      {selected && '✓ '}{opt}
                    </button>
                  );
                })}
              </div>
              {/* Custom tags that user added */}
              {(answers[current.key] || []).filter(v => !current.options.includes(v)).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(answers[current.key] || []).filter(v => !current.options.includes(v)).map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-600 flex items-center gap-1.5"
                      style={{ background: 'rgba(37,99,235,0.1)', color: '#1d4ed8', border: '1px solid rgba(37,99,235,0.2)' }}>
                      {tag}
                      <button onClick={() => setAnswers(prev => ({ ...prev, [current.key]: (prev[current.key] || []).filter(v => v !== tag) }))}
                        className="hover:text-red-500 transition-colors" style={{ fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              {current.type === 'multi-custom' && (
                <input
                  type="text"
                  onKeyDown={handleCustomMultiAdd}
                  placeholder="Type a custom skill/interest and press Enter..."
                  className="input-field"
                  style={{ fontSize: 13 }}
                />
              )}
            </div>
          )}

          {/* Text input */}
          {current.type === 'text' && (
            <textarea
              value={answers[current.key] || ''}
              onChange={handleText}
              placeholder={current.placeholder}
              className="input-field resize-none"
              rows={4}
              style={{ fontSize: 14 }}
            />
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-10">
            {step > 0 && (
              <button onClick={handleBack} className="btn-secondary flex-1 justify-center py-3">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext} disabled={!isStepValid()} className="btn-primary flex-1 justify-center py-3">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!isStepValid()} className="btn-primary flex-1 justify-center py-3" style={{ background: '#16a34a' }}>
                <Sparkles size={16} /> Generate My AI Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateLearningPath, completeTopic } from '../../lib/api';
import { BookOpen, Sparkles, CheckCircle, Circle, Clock, ChevronDown, ChevronUp, ExternalLink, Loader, Plus, Zap } from 'lucide-react';

const INTEREST_OPTIONS = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'UI/UX Design', 'DevOps', 'System Design', 'Algorithms', 'TypeScript', 'Mobile Dev'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

const diffColor = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };

export default function LearningPath() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [path, setPath] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [completedTopics, setCompletedTopics] = useState(new Set());

  const [form, setForm] = useState({
    interests: ['JavaScript'],
    skillLevel: 'beginner',
    goals: '',
  });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    const saved = localStorage.getItem('mentra_learning_path');
    if (saved) { try { setPath(JSON.parse(saved)); } catch(e) {} }
    const savedCompleted = localStorage.getItem('mentra_completed_topics');
    if (savedCompleted) { try { setCompletedTopics(new Set(JSON.parse(savedCompleted))); } catch(e) {} }
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await generateLearningPath(form);
      const newPath = res.data;
      setPath(newPath);
      setShowForm(false);
      localStorage.setItem('mentra_learning_path', JSON.stringify(newPath));
    } catch (err) {
      alert('Failed to generate path. Please check server connection.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTopic = (idx) => setExpandedTopics(prev => ({ ...prev, [idx]: !prev[idx] }));

  const markComplete = async (topic) => {
    const newSet = new Set(completedTopics);
    if (newSet.has(topic)) newSet.delete(topic);
    else newSet.add(topic);
    setCompletedTopics(newSet);
    localStorage.setItem('mentra_completed_topics', JSON.stringify([...newSet]));
    try { await completeTopic(topic); } catch(e) {}
  };

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const progress = path ? Math.round((completedTopics.size / (path.topics?.length || 1)) * 100) : 0;

  if (loading || !user) return null;

  return (
    <DashboardLayout title="Learning Path">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* Generate / form button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-700" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>
              {path ? path.title : 'Your Learning Path'}
            </h2>
            {path && <p className="text-sm mt-0.5 text-slate-500">{path.description}</p>}
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
            <Sparkles size={14} />
            {path ? 'Regenerate' : 'Generate Path'}
          </button>
        </div>

        {/* Generate form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 animate-slide-up space-y-5">
            <h3 className="font-600" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>Customize your path</h3>

            <div>
              <label className="block text-sm font-500 mb-2" style={{ fontWeight: 500 }}>Select your interests</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => toggleInterest(opt)}
                    className="text-sm py-1.5 px-3 rounded-full transition-all"
                    style={{
                      background: form.interests.includes(opt) ? 'rgba(37,99,235,0.25)' : '#f8fafc',
                      border: `1px solid ${form.interests.includes(opt) ? 'rgba(37,99,235,0.5)' : 'rgba(37,99,235,0.1)'}`,
                      color: form.interests.includes(opt) ? '#3b82f6' : '#94a3b8',
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-500 mb-2" style={{ fontWeight: 500 }}>Skill level</label>
              <div className="flex gap-3">
                {LEVELS.map(lvl => (
                  <button key={lvl} onClick={() => setForm(p => ({ ...p, skillLevel: lvl }))}
                    className="flex-1 py-2 rounded-xl text-sm capitalize transition-all"
                    style={{
                      background: form.skillLevel === lvl ? `${diffColor[lvl]}20` : '#f8fafc',
                      border: `1px solid ${form.skillLevel === lvl ? diffColor[lvl] + '50' : 'rgba(37,99,235,0.1)'}`,
                      color: form.skillLevel === lvl ? diffColor[lvl] : '#94a3b8',
                      fontWeight: form.skillLevel === lvl ? 600 : 400,
                    }}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-500 mb-2" style={{ fontWeight: 500 }}>Your goals (optional)</label>
              <textarea value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))}
                placeholder="e.g. Get a frontend job, build a SaaS product, learn ML for data science..."
                className="input-field resize-none" rows={2} />
            </div>

            <button onClick={generate} disabled={generating || form.interests.length === 0} className="btn-primary w-full justify-center">
              {generating ? (
                <><Loader size={15} className="animate-spin" /> Generating your path...</>
              ) : (
                <><Zap size={15} /> Generate AI Learning Path</>
              )}
            </button>
          </div>
        )}

        {/* No path yet */}
        {!path && !showForm && (
          <div className="glass rounded-2xl p-12 text-center">
            <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'rgba(37,99,235,0.4)' }} />
            <h3 className="text-lg font-600 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>No learning path yet</h3>
            <p className="text-sm mb-6 text-slate-500">Generate a personalized AI learning path based on your interests and goals.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Sparkles size={15} /> Generate my learning path
            </button>
          </div>
        )}

        {/* Path display */}
        {path && (
          <>
            {/* Progress bar */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-500" style={{ fontWeight: 500 }}>Overall Progress</p>
                  <p className="text-xs text-slate-500">{completedTopics.size} of {path.topics?.length || 0} topics completed</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-700 gradient-text" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{progress}%</p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                    <Clock size={11} />
                    {path.totalEstimatedHours}h total
                  </div>
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-slate-100">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#1d4ed8,#2563eb,#3b82f6)' }} />
              </div>
            </div>

            {/* Topics list */}
            <div className="space-y-3">
              {(path.topics || []).map((topic, idx) => {
                const isCompleted = completedTopics.has(topic.title);
                const isExpanded = expandedTopics[idx];
                return (
                  <div key={idx} className={`rounded-2xl overflow-hidden transition-all bg-white border ${isCompleted ? 'opacity-80 border-green-200' : 'border-slate-200'}`}>

                    {/* Topic header */}
                    <div className="flex items-center gap-4 p-4 cursor-pointer select-none" onClick={() => toggleTopic(idx)}>
                      {/* Order badge */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                        style={{ background: isCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(37,99,235,0.15)', border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(37,99,235,0.25)'}`, color: isCompleted ? '#4ade80' : '#3b82f6', fontWeight: 700 }}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-500 text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`} style={{ fontWeight: 500 }}>
                            {topic.title}
                          </p>
                          <span className="badge text-xs" style={{ background: `${diffColor[topic.difficulty] || '#2563eb'}15`, color: diffColor[topic.difficulty] || '#3b82f6', border: `1px solid ${diffColor[topic.difficulty] || '#2563eb'}25`, padding: '1px 8px' }}>
                            {topic.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={10} />{topic.estimatedHours}h</span>
                          {topic.resources?.length > 0 && <span>{topic.resources.length} resources</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); markComplete(topic.title); }}
                          className="p-1.5 rounded-lg transition-all hover:bg-white/5">
                          {isCompleted
                            ? <CheckCircle size={20} style={{ color: '#4ade80' }} />
                            : <Circle size={20} className="text-slate-300" />}
                        </button>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 space-y-3" style={{ borderTop: '1px solid rgba(37,99,235,0.08)' }}>
                        <p className="text-sm mt-3 text-slate-600 leading-relaxed">{topic.description}</p>
                        {topic.resources?.length > 0 && (
                          <div>
                            <p className="text-xs font-600 mb-2 text-slate-400 uppercase tracking-wider">Resources</p>
                            <div className="space-y-1.5">
                              {topic.resources.map((res, ri) => (
                                <a key={ri} href={res.url !== '#' ? res.url : undefined}
                                  target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                                  style={{ color: '#3b82f6', border: '1px solid rgba(37,99,235,0.1)' }}>
                                  <span className="text-base">{res.type === 'video' ? '🎬' : res.type === 'docs' ? '📄' : res.type === 'code' ? '💻' : '📚'}</span>
                                  {res.title}
                                  <ExternalLink size={12} className="ml-auto" style={{ color: 'rgba(160,160,200,0.3)' }} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        <button onClick={() => markComplete(topic.title)}
                          className={`text-sm py-2 px-4 rounded-xl font-500 transition-all ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ fontWeight: 500 }}>
                          {isCompleted ? '↩ Mark incomplete' : '✓ Mark as complete'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { startJourney, getMyJourney, submitJourneyQuiz } from '../../lib/api';
import {
  Rocket, Target, CheckCircle, Circle, Clock, ChevronRight,
  Sparkles, Loader, Map, Trophy, ArrowRight, Zap, Lock, Play,
  AlertTriangle, Award, X, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';

// ─── Journey Starter Form ───────────────────────────────────────────────────
const JourneyStarter = ({ onStart }) => {
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('beginner');
  const [days, setDays] = useState(7);
  const [creating, setCreating] = useState(false);

  const handleStart = async () => {
    if (!goal.trim()) return;
    setCreating(true);
    try {
      const res = await startJourney({ goal: goal.trim(), experience_level: level, duration_days: days });
      onStart(res.data);
    } catch (e) {
      alert('Failed to create journey. Try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
          <Rocket size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Start Your Journey</h2>
        <p className="text-sm text-slate-500">Tell us your goal — AI builds a personalized path with daily lessons and quizzes.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs font-600 text-slate-500 mb-1.5 uppercase tracking-wider">What do you want to learn?</label>
          <input value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="e.g. Build a full-stack app with React and Node.js"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50" />
        </div>
        <div>
          <label className="block text-xs font-600 text-slate-500 mb-1.5 uppercase tracking-wider">Experience Level</label>
          <div className="grid grid-cols-3 gap-2">
            {['beginner', 'intermediate', 'advanced'].map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className="py-2.5 rounded-xl text-sm font-500 border transition-all capitalize"
                style={{
                  background: level === l ? 'rgba(37,99,235,0.1)' : '#f8fafc',
                  borderColor: level === l ? '#3b82f6' : '#e2e8f0',
                  color: level === l ? '#2563eb' : '#64748b',
                  fontWeight: level === l ? 600 : 400,
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-600 text-slate-500 mb-1.5 uppercase tracking-wider">Duration: {days} days</label>
          <input type="range" min={3} max={30} value={days} onChange={e => setDays(parseInt(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1"><span>3 days</span><span>30 days</span></div>
        </div>
        <button onClick={handleStart} disabled={creating || !goal.trim()}
          className="w-full py-3.5 rounded-xl text-sm font-600 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          style={{ background: creating || !goal.trim() ? '#94a3b8' : 'linear-gradient(135deg,#1d4ed8,#2563eb)', cursor: creating || !goal.trim() ? 'not-allowed' : 'pointer' }}>
          {creating ? <><Loader size={16} className="animate-spin" /> AI is generating your path...</> : <><Sparkles size={16} /> Generate My Journey</>}
        </button>
      </div>
    </div>
  );
};

// ─── Reward Popup ───────────────────────────────────────────────────────────
const RewardPopup = ({ reward, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-slide-up">
      <div className="text-6xl mb-4">🎁</div>
      <h3 className="text-xl font-700 text-slate-800 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Reward Unlocked!</h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">{reward.reward_text}</p>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-amber-600 font-600 uppercase tracking-wider mb-1">Milestone</p>
        <p className="text-lg font-700 text-amber-700" style={{ fontWeight: 700 }}>{reward.milestone_days} Days Completed 🔥</p>
      </div>
      <button onClick={onClose}
        className="w-full py-3 rounded-xl text-sm font-600 text-white"
        style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
        Awesome! Continue Learning
      </button>
    </div>
  </div>
);

// ─── Quiz Results Popup ─────────────────────────────────────────────────────
const QuizResult = ({ result, onRetry, onContinue }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-slide-up">
      <div className="text-5xl mb-3">{result.passed ? '🎉' : '😅'}</div>
      <h3 className="text-xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>
        {result.passed ? 'Congratulations!' : 'Almost There!'}
      </h3>
      <p className="text-sm text-slate-500 mb-4">{result.passed ? 'You passed the quiz and unlocked the next day!' : 'You need at least 80% to pass. Review and try again.'}</p>

      {/* Score circle */}
      <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 border-4"
        style={{
          borderColor: result.passed ? '#22c55e' : '#f59e0b',
          background: result.passed ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
        }}>
        <div>
          <p className="text-2xl font-700" style={{ fontWeight: 700, color: result.passed ? '#16a34a' : '#d97706' }}>{result.score}%</p>
          <p className="text-[10px] text-slate-400">{result.correct}/{result.total}</p>
        </div>
      </div>

      {/* Answer summary */}
      <div className="text-left space-y-2 mb-6 max-h-48 overflow-y-auto">
        {result.results?.map((r, i) => (
          <div key={i} className={`text-xs p-2.5 rounded-lg flex items-start gap-2 ${r.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <span className="flex-shrink-0 mt-0.5">{r.isCorrect ? <CheckCircle size={12} /> : <X size={12} />}</span>
            <span>{r.question}</span>
          </div>
        ))}
      </div>

      {result.passed ? (
        <button onClick={onContinue}
          className="w-full py-3 rounded-xl text-sm font-600 text-white"
          style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
          <CheckCircle size={16} className="inline mr-1" /> Continue Journey
        </button>
      ) : (
        <button onClick={onRetry}
          className="w-full py-3 rounded-xl text-sm font-600 text-white"
          style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
          <AlertTriangle size={16} className="inline mr-1" /> Retry Quiz
        </button>
      )}
    </div>
  </div>
);

// ─── Day Card (expanded view with video + quiz) ─────────────────────────────
const DayCard = ({ task, isCurrent, onQuizSubmit, submitting }) => {
  const [expanded, setExpanded] = useState(isCurrent && !task.is_completed);
  const [studying, setStudying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const quiz = task.quiz || [];
  const isLocked = !task.is_unlocked;

  const allAnswered = quiz.length > 0 && Object.keys(answers).length === quiz.length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    const ordered = quiz.map((_, i) => answers[i]);
    onQuizSubmit(task.id, ordered);
  };

  // Extract YouTube video embed URL
  const getYouTubeEmbed = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return null; // It's a search URL, show link instead
  };

  const embedUrl = getYouTubeEmbed(task.resource_link);

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
          task.is_completed ? 'bg-green-500 border-green-500 text-white' :
          isCurrent ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200' :
          isLocked ? 'bg-slate-100 border-slate-200 text-slate-300' :
          'bg-white border-slate-200 text-slate-400'
        }`}>
          {task.is_completed ? <CheckCircle size={16} /> :
           isLocked ? <Lock size={14} /> :
           <span className="text-xs font-700" style={{ fontWeight: 700 }}>{task.day_number}</span>}
        </div>
        <div className="w-0.5 flex-1 min-h-[24px]" style={{ background: task.is_completed ? '#86efac' : '#e2e8f0' }} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className={`rounded-xl border transition-all overflow-hidden ${
          task.is_completed ? 'border-green-100 bg-green-50/30' :
          isCurrent ? 'border-blue-200 bg-white shadow-md' :
          isLocked ? 'border-slate-100 bg-slate-50/50 opacity-60' :
          'border-slate-100 bg-white'
        }`}>
          {/* Header (always visible) */}
          <button onClick={() => !isLocked && setExpanded(!expanded)}
            disabled={isLocked}
            className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-700 uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    background: task.is_completed ? 'rgba(34,197,94,0.1)' : isCurrent ? 'rgba(37,99,235,0.1)' : 'rgba(100,116,139,0.06)',
                    color: task.is_completed ? '#16a34a' : isCurrent ? '#2563eb' : '#94a3b8',
                    fontWeight: 700,
                  }}>
                  Day {task.day_number}
                </span>
                {isCurrent && !task.is_completed && <span className="text-[10px] font-600 text-blue-500 flex items-center gap-0.5"><Zap size={10} /> Current</span>}
                {task.is_completed && task.score > 0 && <span className="text-[10px] font-600 text-green-600">{task.score}% score</span>}
              </div>
              <h4 className={`text-sm font-600 ${task.is_completed ? 'text-green-700' : isLocked ? 'text-slate-400' : 'text-slate-800'}`} style={{ fontWeight: 600 }}>
                {task.topic || task.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
            </div>
            {!isLocked && (
              <div className="ml-3 text-slate-400">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </button>

          {/* Expanded content */}
          {expanded && !isLocked && (
            <div className="px-4 pb-5 border-t border-slate-100 pt-5">
              
              {!task.is_completed && !studying && !showQuiz && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} className="text-blue-500" />
                  </div>
                  <h5 className="text-sm font-600 text-slate-800 mb-1" style={{ fontWeight: 600 }}>Ready to learn?</h5>
                  <p className="text-xs text-slate-500 mb-4">You'll need to review the material before taking the quiz.</p>
                  <button onClick={() => setStudying(true)}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white text-xs font-600 hover:bg-blue-700 transition-all">
                    Start Learning
                  </button>
                </div>
              )}

              {/* Learning Resource */}
              {studying && !showQuiz && (
                <div className="space-y-4 animate-fade-in">
                  <h5 className="text-xs font-700 text-slate-600 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Play size={12} className="text-red-500" /> Lesson Material
                  </h5>
                  {embedUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                      <iframe src={embedUrl} className="w-full h-full" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen title={task.topic} />
                    </div>
                  ) : task.resource_link ? (
                    <a href={task.resource_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all group">
                      <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <Play size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-600 text-slate-800" style={{ fontWeight: 600 }}>Watch Lesson on YouTube</p>
                        <p className="text-xs text-slate-500">Tutorial: {task.topic}</p>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-slate-300" />
                    </a>
                  ) : (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                      <p className="font-600 mb-1" style={{ fontWeight: 600 }}>Self-Study Module:</p>
                      <p className="text-xs">Research and study the core concepts of <strong>{task.topic}</strong>. Review official documentation and community tutorials.</p>
                    </div>
                  )}
                  
                  <div className="flex justify-center pt-2">
                    <button onClick={() => setShowQuiz(true)}
                      className="px-8 py-2.5 rounded-xl bg-green-600 text-white text-sm font-600 shadow-md shadow-green-100 hover:bg-green-700 transition-all">
                      I'm Done Learning, Let's Quiz!
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz Section */}
              {showQuiz && quiz.length > 0 && !task.is_completed && (
                <div className="space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-700 text-slate-600 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Target size={12} className="text-blue-500" /> Knowledge Check
                    </h5>
                    <button onClick={() => setShowQuiz(false)} className="text-[10px] text-slate-400 hover:text-blue-500">Review Lesson Again</button>
                  </div>
                  
                  <div className="space-y-4">
                    {quiz.map((q, qi) => (
                      <div key={qi} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-sm font-600 text-slate-800 mb-3" style={{ fontWeight: 600 }}>
                          {qi + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => (
                            <label key={oi}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                                answers[qi] === opt
                                  ? 'bg-blue-50 border-blue-300 text-blue-700 ring-4 ring-blue-50'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 shadow-sm'
                              }`}>
                              <input type="radio" name={`q-${qi}`} value={opt}
                                checked={answers[qi] === opt}
                                onChange={() => setAnswers(prev => ({ ...prev, [qi]: opt }))}
                                className="accent-blue-600" />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button onClick={handleSubmit} disabled={!allAnswered || submitting}
                      className="w-full py-3.5 rounded-xl text-sm font-600 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                      style={{ background: allAnswered && !submitting ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#94a3b8', cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed' }}>
                      {submitting ? <><Loader size={14} className="animate-spin" /> Evaluating Score...</> : <><CheckCircle size={14} /> Submit Answers</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Completed quiz info */}
              {task.is_completed && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="font-700 text-sm" style={{ fontWeight: 700 }}>Day {task.day_number} Mastered!</p>
                      <p className="text-xs opacity-80">You achieved a score of {task.score}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Journey Page ──────────────────────────────────────────────────────
export default function JourneyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [journey, setJourney] = useState(undefined); // undefined=loading, null=none
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [reward, setReward] = useState(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { if (user) loadJourney(); }, [user]);

  const loadJourney = async () => {
    try {
      const res = await getMyJourney();
      setJourney(res.data);
    } catch (e) {
      setJourney(null);
    }
  };

  const handleQuizSubmit = async (taskId, answers) => {
    setSubmitting(true);
    try {
      const res = await submitJourneyQuiz(taskId, answers);
      setQuizResult(res.data);
      if (res.data.reward) setReward(res.data.reward);
    } catch (e) {
      alert('Failed to submit quiz. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizClose = () => {
    setQuizResult(null);
    loadJourney(); // Refresh data
  };

  const handleNewJourney = () => {
    setJourney(null);
  };

  const handleJourneyCreated = (data) => {
    loadJourney();
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout title="My Journey">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

        {/* Loading */}
        {journey === undefined && (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-2 items-center text-sm text-slate-400">
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
              Loading your journey...
            </div>
          </div>
        )}

        {/* No journey → starter */}
        {journey === null && <JourneyStarter onStart={handleJourneyCreated} />}

        {/* Active journey */}
        {journey && journey.tasks && (
          <>
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                    <Map size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-700 text-slate-800" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{journey.goal}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="capitalize">{journey.experience_level}</span>
                      · {journey.duration_days} days
                      · {journey.completedDays || 0} completed
                    </p>
                  </div>
                </div>
                {journey.progress === 100 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-600 border border-green-100">
                    <Trophy size={14} /> Journey Complete!
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${journey.progress}%`, background: journey.progress === 100 ? '#22c55e' : 'linear-gradient(90deg,#1d4ed8,#3b82f6)' }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-400 font-600" style={{ fontWeight: 600 }}>{journey.progress}% complete</span>
                <span className="text-xs text-slate-400">{journey.completedDays || 0}/{journey.tasks.length} days</span>
              </div>
            </div>

            {/* Task Timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-700 text-slate-600 mb-5 uppercase tracking-wider flex items-center gap-2" style={{ fontWeight: 700 }}>
                <Target size={14} className="text-blue-500" /> Learning Timeline
              </h3>
              <div>
                {journey.tasks.map(task => (
                  <DayCard
                    key={task.id}
                    task={task}
                    isCurrent={task.day_number === journey.currentDay}
                    onQuizSubmit={handleQuizSubmit}
                    submitting={submitting}
                  />
                ))}
              </div>
            </div>

            {/* Start New Journey */}
            {journey.progress === 100 && (
              <div className="text-center">
                <button onClick={handleNewJourney}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-600 text-white shadow-lg shadow-blue-200"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                  <Rocket size={16} /> Start a New Journey
                </button>
              </div>
            )}
          </>
        )}

        {/* Quiz Result Popup */}
        {quizResult && (
          <QuizResult
            result={quizResult}
            onRetry={handleQuizClose}
            onContinue={handleQuizClose}
          />
        )}

        {/* Reward Popup */}
        {reward && (
          <RewardPopup reward={reward} onClose={() => setReward(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}

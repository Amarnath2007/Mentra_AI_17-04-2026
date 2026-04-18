import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateQuiz } from '../../lib/api';
import { Brain, Sparkles, ChevronRight, Trophy, RefreshCw, CheckCircle, XCircle, Loader, Clock } from 'lucide-react';

const TOPICS = ['JavaScript', 'React', 'Python', 'Node.js', 'CSS', 'TypeScript', 'Data Structures', 'Algorithms', 'SQL', 'Machine Learning', 'System Design', 'Docker'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const diffColor = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };

export default function Quiz() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [topic, setTopic] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  if (authLoading || (!user && typeof window !== 'undefined')) { if(!authLoading) router.push('/login'); return null; }

  const start = async () => {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setQuiz(null);
    try {
      const res = await generateQuiz({ topic, difficulty });
      setQuiz(res.data);
      setTimeLeft(res.data.questions.length * 30); // 30s per question
      // Countdown
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      alert('Failed to generate quiz. Please check server.');
    } finally {
      setLoading(false);
    }
  };

  const answer = (qId, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const submit = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const scorePercent = quiz ? Math.round((score / quiz.questions.length) * 100) : 0;
  const scoreColor = scorePercent >= 80 ? '#22c55e' : scorePercent >= 60 ? '#f59e0b' : '#ef4444';
  const answered = Object.keys(answers).length;

  return (
    <DashboardLayout title="Quiz">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

        {/* Setup card */}
        {!quiz && (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-brand-50 border border-brand-100">
              <Brain size={32} style={{ color: '#3b82f6' }} />
            </div>
            <h2 className="text-2xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>AI Quiz Generator</h2>
            <p className="text-sm mb-8 text-slate-500 dark:text-slate-400">Test your knowledge with AI-generated questions on any topic</p>

            <div className="text-left space-y-5">
              <div>
                <label className="block text-sm font-500 mb-2" style={{ fontWeight: 500 }}>Choose a topic</label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map(t => (
                    <button key={t} onClick={() => setTopic(t)}
                      className="text-sm py-1.5 px-3.5 rounded-full transition-all"
                      style={{
                        background: topic === t ? 'rgba(37,99,235,0.1)' : '#f8fafc',
                        border: `1px solid ${topic === t ? 'rgba(37,99,235,0.4)' : '#e2e8f0'}`,
                        color: topic === t ? '#3b82f6' : '#64748b',
                        fontWeight: topic === t ? 600 : 400,
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-500 mb-2" style={{ fontWeight: 500 }}>Difficulty</label>
                <div className="flex gap-3">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className="flex-1 py-2 rounded-xl text-sm capitalize transition-all"
                      style={{
                        background: difficulty === d ? `${diffColor[d]}15` : '#f8fafc',
                        border: `1px solid ${difficulty === d ? diffColor[d] : '#e2e8f0'}`,
                        color: difficulty === d ? diffColor[d] : '#64748b',
                        fontWeight: difficulty === d ? 600 : 400,
                      }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={start} disabled={loading} className="btn-primary w-full justify-center mt-6 py-3.5 text-base">
              {loading ? <><Loader size={16} className="animate-spin" /> Generating quiz...</> : <><Sparkles size={16} /> Start Quiz</>}
            </button>
          </div>
        )}

        {/* Quiz in progress */}
        {quiz && !submitted && (
          <>
            {/* Quiz header */}
            <div className="glass rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-600 text-sm" style={{ fontWeight: 600 }}>{quiz.topic} Quiz</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{answered} of {quiz.questions.length} answered</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm" style={{ color: timeLeft < 30 ? '#ef4444' : '#64748b' }}>
                  <Clock size={14} />
                  <span className="font-mono">{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
                </div>
                <div className="w-24 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(answered / quiz.questions.length) * 100}%`, background: 'linear-gradient(90deg,#1d4ed8,#2563eb)' }} />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {quiz.questions.map((q, qi) => (
                <div key={q.id} className="glass rounded-2xl p-5">
                  <p className="font-500 text-sm mb-4 flex gap-2" style={{ fontWeight: 500 }}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: 'rgba(37,99,235,0.1)', color: '#3b82f6', fontWeight: 700 }}>
                      {qi + 1}
                    </span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id] === oi;
                      return (
                        <button key={oi} onClick={() => answer(q.id, oi)}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3"
                          style={{
                            background: selected ? 'rgba(37,99,235,0.1)' : '#f8fafc',
                            border: `1px solid ${selected ? 'rgba(37,99,235,0.4)' : '#e2e8f0'}`,
                            color: selected ? '#3b82f6' : '#334155',
                          }}>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-700"
                            style={{ background: selected ? '#2563eb' : '#f1f5f9', color: selected ? 'white' : '#64748b', fontWeight: 700 }}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={submit} disabled={answered < quiz.questions.length} className="btn-primary w-full justify-center py-3.5">
              {answered < quiz.questions.length ? `Answer all questions (${quiz.questions.length - answered} left)` : 'Submit Quiz'}
            </button>
          </>
        )}

        {/* Results */}
        {quiz && submitted && (
          <>
            {/* Score card */}
            <div className="glass rounded-2xl p-8 text-center" style={{ border: `1px solid ${scoreColor}25` }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex flex-col items-center justify-center"
                style={{ background: `${scoreColor}15`, border: `2px solid ${scoreColor}40` }}>
                <Trophy size={28} style={{ color: scoreColor }} />
              </div>
              <h2 className="text-4xl font-700 mb-1" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, color: scoreColor }}>
                {scorePercent}%
              </h2>
              <p className="font-500 mb-1" style={{ fontWeight: 500 }}>
                {score} / {quiz.questions.length} correct
              </p>
              <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">
                {scorePercent >= 80 ? '🎉 Excellent work!' : scorePercent >= 60 ? '👍 Good effort, keep practicing!' : '📚 Review the material and try again.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={start} className="btn-primary">
                  <RefreshCw size={14} /> Try again
                </button>
                <button onClick={() => setQuiz(null)} className="btn-secondary">
                  <ChevronRight size={14} /> New topic
                </button>
              </div>
            </div>

            {/* Question review */}
            <div className="space-y-4">
              <h3 className="font-600" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>Review Answers</h3>
              {quiz.questions.map((q, qi) => {
                const userAnswer = answers[q.id];
                const correct = userAnswer === q.answer;
                return (
                  <div key={q.id} className="rounded-2xl p-5 bg-white dark:bg-slate-900 border shadow-sm" style={{ borderColor: correct ? '#86efac' : '#fca5a5' }}>
                    <div className="flex items-start gap-2 mb-3">
                      {correct ? <CheckCircle size={18} style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }} /> : <XCircle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />}
                      <p className="text-sm font-500" style={{ fontWeight: 500 }}>{q.question}</p>
                    </div>
                    <div className="space-y-1.5 ml-6">
                      {q.options.map((opt, oi) => {
                        const isCorrect = oi === q.answer;
                        const isUser = oi === userAnswer;
                        return (
                          <div key={oi} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                            style={{
                              background: isCorrect ? '#bbf7d0' : isUser && !isCorrect ? '#fecaca' : '#f1f5f9',
                              color: isCorrect ? '#16a34a' : isUser && !isCorrect ? '#dc2626' : '#94a3b8',
                            }}>
                            <span style={{ fontWeight: 700 }}>{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                            {isCorrect && <CheckCircle size={13} className="ml-auto" />}
                            {isUser && !isCorrect && <XCircle size={13} className="ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
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

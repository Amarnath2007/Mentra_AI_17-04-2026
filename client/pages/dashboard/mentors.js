import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getMentors } from '../../lib/api';
import { Users, MessageSquare, Star, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';

const MOCK_MENTORS = [
  { id: 'm1', name: 'Dr. Priya Sharma', role: 'mentor', skills: ['React', 'Node.js', 'System Design', 'TypeScript'], bio: 'Full-stack engineer with 10+ years at top tech firms. Specializes in scalable web apps and mentoring junior devs.', rating: 4.9, students: 34, avatar: '' },
  { id: 'm2', name: 'Arjun Mehta', role: 'mentor', skills: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow'], bio: 'AI/ML engineer with publications in NeurIPS. Passionate about making ML accessible to everyone.', rating: 4.8, students: 28, avatar: '' },
  { id: 'm3', name: 'Fatima Al-Hassan', role: 'mentor', skills: ['UI/UX', 'Figma', 'CSS', 'Product Design'], bio: 'Senior product designer with 8 years in EdTech and FinTech. Loves teaching design thinking.', rating: 4.9, students: 41, avatar: '' },
  { id: 'm4', name: 'Marcus Chen', role: 'mentor', skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes'], bio: 'Cloud architect at a Fortune 500. Specializes in CI/CD pipelines and infrastructure automation.', rating: 4.7, students: 19, avatar: '' },
  { id: 'm5', name: 'Sofia Rodriguez', role: 'mentor', skills: ['Algorithms', 'Data Structures', 'LeetCode', 'Java'], bio: 'CS PhD and competitive programmer. Has helped 40+ students land FAANG jobs through interview prep.', rating: 5.0, students: 52, avatar: '' },
  { id: 'm6', name: 'Raj Patel', role: 'mentor', skills: ['Mobile Dev', 'React Native', 'Flutter', 'iOS'], bio: 'Mobile app developer with 15+ published apps. Founder of a mobile-first EdTech startup.', rating: 4.8, students: 23, avatar: '' },
];

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = [
  'linear-gradient(135deg,#1d4ed8,#a78bfa)',
  'linear-gradient(135deg,#fb923c,#ef4444)',
  'linear-gradient(135deg,#22c55e,#3b82f6)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
];

export default function Mentors() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState(MOCK_MENTORS);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    getMentors()
      .then(res => { if (res.data?.length > 0) setMentors(res.data); })
      .catch(() => {});
  }, []);

  const allSkills = [...new Set(MOCK_MENTORS.flatMap(m => m.skills))].sort();

  const filtered = mentors.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchSkill = !selectedSkill || m.skills?.includes(selectedSkill);
    return matchSearch && matchSkill;
  });

  if (loading || !user) return null;

  return (
    <DashboardLayout title="Mentors">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-700 flex items-center gap-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>
              <Users size={20} style={{ color: '#a78bfa' }} /> Expert Mentors
            </h2>
            <p className="text-sm mt-1 text-slate-500">{filtered.length} mentors available to guide you</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or skill..."
              className="input-field pl-9 py-2 text-sm" />
          </div>
        </div>

        {/* Skill filter */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedSkill('')}
            className="text-xs py-1.5 px-3 rounded-full transition-all"
            style={{ background: !selectedSkill ? 'rgba(37,99,235,0.25)' : '#f8fafc', border: `1px solid ${!selectedSkill ? 'rgba(37,99,235,0.5)' : 'rgba(37,99,235,0.1)'}`, color: !selectedSkill ? '#3b82f6' : '#94a3b8' }}>
            All
          </button>
          {allSkills.map(skill => (
            <button key={skill} onClick={() => setSelectedSkill(skill === selectedSkill ? '' : skill)}
              className="text-xs py-1.5 px-3 rounded-full transition-all"
              style={{ background: selectedSkill === skill ? 'rgba(37,99,235,0.25)' : '#f8fafc', border: `1px solid ${selectedSkill === skill ? 'rgba(37,99,235,0.5)' : 'rgba(37,99,235,0.1)'}`, color: selectedSkill === skill ? '#3b82f6' : '#94a3b8' }}>
              {skill}
            </button>
          ))}
        </div>

        {/* Mentors grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mentor, idx) => (
            <div key={mentor.id} className="glass rounded-2xl p-5 flex flex-col gap-4 card-hover">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-700 flex-shrink-0"
                  style={{ background: avatarColors[idx % avatarColors.length], fontWeight: 700, fontFamily: 'Sora,sans-serif' }}>
                  {getInitials(mentor.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-600 text-sm truncate" style={{ fontWeight: 600 }}>{mentor.name}</p>
                  <span className="badge badge-mentor text-xs">mentor</span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs flex-shrink-0" style={{ color: '#f59e0b' }}>
                  <Star size={11} fill="#f59e0b" />
                  <span style={{ fontWeight: 600 }}>{mentor.rating || '4.9'}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs leading-relaxed line-clamp-2 text-slate-600">
                {mentor.bio}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {(mentor.skills || []).slice(0, 4).map(skill => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-500 border border-brand-100">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <BookOpen size={11} />
                  <span>{mentor.students || Math.floor(Math.random() * 40 + 10)} students</span>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/chat"
                    className="flex items-center gap-1 text-xs btn-secondary py-1.5 px-3">
                    <MessageSquare size={11} /> Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto mb-3" style={{ color: 'rgba(37,99,235,0.3)' }} />
            <p className="font-500" style={{ fontWeight: 500 }}>No mentors found</p>
            <p className="text-sm mt-1 text-slate-400">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

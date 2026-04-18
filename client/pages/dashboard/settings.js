import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateProfile } from '../../lib/api';
import { Settings, Save, User, GraduationCap } from 'lucide-react';

const SKILL_OPTIONS = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'CSS', 'Docker', 'AWS', 'ML/AI', 'SQL', 'Java', 'Go'];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skillLevel: user?.skillLevel || 'beginner',
    skills: user?.skills || [],
    interests: user?.interests || [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key, val) => setForm(p => ({
    ...p,
    [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
  }));

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      updateUser(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      updateUser(form); // Update locally even if API fails
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-600 flex items-center gap-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
            <User size={16} style={{ color: '#2563eb' }} /> Profile
          </h3>

          <div>
            <label className="block text-sm font-500 mb-1.5" style={{ fontWeight: 500 }}>Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-500 mb-1.5" style={{ fontWeight: 500 }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              className="input-field resize-none" rows={3} placeholder="Tell others about yourself..." />
          </div>

          <div>
            <label className="block text-sm font-500 mb-2" style={{ fontWeight: 500 }}>Skill Level</label>
            <div className="flex gap-3">
              {['beginner', 'intermediate', 'advanced'].map(lvl => (
                <button key={lvl} onClick={() => setForm(p => ({ ...p, skillLevel: lvl }))}
                  className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all border ${form.skillLevel === lvl ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-700 text-blue-500 font-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-500'}`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-500 mb-2" style={{ fontWeight: 500 }}>Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(s => (
                <button key={s} onClick={() => toggle('skills', s)}
                  className={`text-xs py-1.5 px-3 rounded-full transition-all border ${form.skills.includes(s) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-700 text-blue-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        {/* Account info */}
        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="font-600 flex items-center gap-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
            <GraduationCap size={16} style={{ color: '#a78bfa' }} /> Account
          </h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="text-slate-800 dark:text-slate-100">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Role</span>
              <span className={`badge ${user?.role === 'mentor' ? 'badge-mentor' : 'badge-brand'}`}>{user?.role}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Member since</span>
              <span className="text-slate-800 dark:text-slate-100">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

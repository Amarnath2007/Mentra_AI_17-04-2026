import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BookOpen, PlayCircle, CheckCircle, Clock } from 'lucide-react';

export default function Courses() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading || (!user && typeof window !== 'undefined')) {
    if (!loading) router.push('/login');
    return null;
  }

  return (
    <DashboardLayout title="Explore Courses">
      <div className="max-w-4xl mx-auto animate-fade-in space-y-5">
        <div>
          <h2 className="text-xl font-700" style={{ fontFamily: 'Sora,sans-serif' }}>Premium Courses</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Accelerate your career with industry-recognized certifications.</p>
        </div>

        {/* Smaller Course Card */}
        <div className="glass rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 group flex flex-col sm:flex-row bg-white dark:bg-slate-900 max-w-2xl">
          
          <div className="w-full sm:w-1/3 relative bg-slate-900 overflow-hidden flex items-center justify-center p-6 min-h-[200px]">
            <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-all duration-500"></div>
            <div className="relative z-10 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                    <BookOpen size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-800 text-white leading-tight" style={{ fontFamily: 'Sora,sans-serif' }}>Full Stack<br/>Development</h3>
            </div>
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 blur-2xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full"></div>
          </div>

          <div className="w-full sm:w-2/3 p-5 flex flex-col justify-between">
            <div>
                <div className="mb-2">
                    <span className="badge" style={{ background: '#e0e7ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '3px 8px' }}>Official Certificate</span>
                </div>
                <h3 className="text-base font-700 mb-2 text-slate-900 dark:text-white" style={{ fontFamily: 'Sora,sans-serif' }}>The Complete Full Stack Developer Program</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 leading-relaxed line-clamp-2">
                  Master the modern web stack. Learn React.js, Node.js, Express, database schema layout, and system architecture by building enterprise apps.
                </p>

                <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[11px] text-slate-700 dark:text-slate-300 mb-5 font-500">
                    <div className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500"/> <span>120+ Hours</span></div>
                    <div className="flex items-center gap-1.5"><PlayCircle size={12} className="text-blue-500"/> <span>500+ Lectures</span></div>
                    <div className="flex items-center gap-1.5"><CheckCircle size={12} className="text-blue-500"/> <span>10 Projects</span></div>
                    <div className="flex items-center gap-1.5"><CheckCircle size={12} className="text-blue-500"/> <span>Mentorship</span></div>
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                <button className="flex-1 btn-primary justify-center py-2 text-xs font-600" onClick={() => alert('Redirecting to secure payment gateway...')}>
                    Buy Course
                </button>
                <button className="flex-1 btn-secondary justify-center py-2 text-xs font-600 bg-white dark:bg-slate-900" onClick={() => alert('Starting your free trial!')}>
                    Free Trial
                </button>
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}

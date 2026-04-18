import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  BookOpen, PlayCircle, CheckCircle, Clock, 
  Megaphone, LineChart, Music, Palette, ArrowRight, Star
} from 'lucide-react';

const COURSES = [
  {
    id: 'fs-001',
    title: 'Full Stack Development',
    fullName: 'The Complete Full Stack Developer Program',
    description: 'Master the modern web stack. Learn React.js, Node.js, Express, and Database architecture.',
    icon: BookOpen,
    color: '#3b82f6',
    hours: '120+',
    lectures: '500+',
    rating: 4.9
  },
  {
    id: 'dm-001',
    title: 'Digital Marketing',
    fullName: 'Growth Hacking & Digital Marketing Masterclass',
    description: 'Master SEO, SEM, SMM, and Email Marketing. Learn how to grow any business online.',
    icon: Megaphone,
    color: '#ec4899',
    hours: '45+',
    lectures: '180+',
    rating: 4.8
  },
  {
    id: 'tr-001',
    title: 'Master Trading',
    fullName: 'The Professional Day Trading & Investing Course',
    description: 'Learn Technical Analysis, Risk Management, and Psychology of Trading in Global Markets.',
    icon: LineChart,
    color: '#8b5cf6',
    hours: '60+',
    lectures: '210+',
    rating: 4.7
  },
  {
    id: 'ms-001',
    title: 'Music Theory & Prod',
    fullName: 'Music Production & Theory for Modern Musicians',
    description: 'Learn to compose, record, and master your own tracks in any DAW. From basic theory to mixing.',
    icon: Music,
    color: '#f59e0b',
    hours: '30+',
    lectures: '120+',
    rating: 4.9
  },
  {
    id: 'ar-001',
    title: 'Creative Art & Design',
    fullName: 'Digital Illustration & Fine Art Techniques',
    description: 'Master sketching, coloring, and composition. Learn both traditional and digital mediums.',
    icon: Palette,
    color: '#10b981',
    hours: '55+',
    lectures: '150+',
    rating: 4.6
  }
];

const CourseCard = ({ course }) => {
  const Icon = course.icon;
  return (
    <div className="glass rounded-xl overflow-hidden shadow-sm border border-slate-200 group flex flex-col bg-white hover:shadow-md transition-all h-full">
      <div className="relative h-40 overflow-hidden flex items-center justify-center p-6" style={{ background: '#0f172a' }}>
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-all duration-500" style={{ backgroundColor: course.color }}></div>
        <div className="relative z-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 shadow-lg" style={{ background: course.color }}>
                <Icon size={20} className="text-white" />
            </div>
            <h3 className="text-base font-800 text-white leading-tight px-4" style={{ fontFamily: 'Sora,sans-serif' }}>{course.title}</h3>
        </div>
        <div className="absolute -bottom-2 -right-2 w-24 h-24 blur-2xl rounded-full opacity-20" style={{ backgroundColor: course.color }}></div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
            <span className="badge" style={{ background: `${course.color}15`, color: course.color, border: `1px solid ${course.color}25`, padding: '2px 8px', fontSize: '10px' }}>Premium</span>
        </div>
        <h3 className="text-sm font-700 mb-2 text-slate-900 line-clamp-1" style={{ fontFamily: 'Sora,sans-serif' }}>{course.fullName}</h3>
        <p className="text-slate-500 text-[11px] mb-4 leading-relaxed line-clamp-2">
          {course.description}
        </p>

        <div className="flex text-[10px] text-slate-700 mb-5 font-500">
            <div className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500"/> <span>Duration: {course.hours} Hours</span></div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
            <button className="flex-1 btn-primary justify-center py-2 text-xs font-600" onClick={() => alert('Redirecting to payment...')}>
                Enroll Now
            </button>
            <button className="flex-1 btn-secondary justify-center py-2 text-xs font-600 bg-white" onClick={() => alert('Trial started!')}>
                Try Free
            </button>
        </div>
      </div>
    </div>
  );
}

export default function Courses() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading || (!user && typeof window !== 'undefined')) {
    if (!loading) router.push('/login');
    return null;
  }

  return (
    <DashboardLayout title="Explore Courses">
      <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
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
          
          <h2 className="text-xl font-700" style={{ fontFamily: 'Sora,sans-serif' }}>Premium Learning Paths</h2>
          <p className="text-sm text-slate-500">Accelerate your career with industry-recognized certifications.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

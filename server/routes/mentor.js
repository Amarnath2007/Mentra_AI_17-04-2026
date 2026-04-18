const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

// Middleware to ensure user is a mentor
const isMentor = (req, res, next) => {
  if (req.user && req.user.role === 'mentor') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Mentor role required.' });
};

// ─── GET /mentor/stats ───────────────────────────────────────────────────────
router.get('/stats', auth, isMentor, async (req, res) => {
  try {
    // For demo/production, we'd query real tables.
    // Fetching actual data from supabase if possible
    let totalStudents = 0;
    let activeStudents = 0;
    
    if (supabase) {
      const { data: students } = await supabase.from('users').select('id, progress').eq('role', 'student');
      totalStudents = students?.length || 0;
      activeStudents = (students || []).filter(s => s.progress?.xpPoints > 0).length;
    }

    res.json({
      totalStudents,
      activeStudents,
      pendingDoubts: 5, // Mocked for now
      sessionsToday: 3, // Mocked for now
      notifications: 8,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /mentor/students ────────────────────────────────────────────────────
router.get('/students', auth, isMentor, async (req, res) => {
  try {
    if (supabase) {
      const { data: students, error } = await supabase.from('users')
        .select('id, name, email, skills, experience_level, progress, interests, onboarding_completed, weaknesses')
        .eq('role', 'student');
      
      if (error) throw error;
      return res.json(students || []);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /mentor/sessions ────────────────────────────────────────────────────
router.get('/sessions', auth, isMentor, async (req, res) => {
  try {
    // In a real app, this would be a separate 'sessions' table
    // For production-ready demo, we'll return some curated mock data if table doesn't exist
    const sessions = [
      { id: 1, studentName: 'Alex Johnson', date: new Date().toISOString(), duration: '45m', type: 'Technical Review', status: 'upcoming' },
      { id: 2, studentName: 'Sarah Miller', date: new Date(Date.now() + 86400000).toISOString(), duration: '1h', type: 'Career Guidance', status: 'pending' },
      { id: 3, studentName: 'David Chen', date: new Date(Date.now() - 3600000).toISOString(), duration: '30m', type: 'Code Debugging', status: 'completed' },
    ];
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /mentor/tasks ───────────────────────────────────────────────────────
router.get('/tasks', auth, isMentor, async (req, res) => {
  try {
    const tasks = [
      { id: 1, title: 'React Performance Optimization', student: 'Alex Johnson', deadline: '2026-04-20', status: 'submitted' },
      { id: 2, title: 'Database Design Schema', student: 'Sarah Miller', deadline: '2026-04-19', status: 'in-progress' },
      { id: 3, title: 'API Security Implementation', student: 'David Chen', deadline: '2026-04-18', status: 'reviewed' },
    ];
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /mentor/analytics ───────────────────────────────────────────────────
router.get('/analytics', auth, isMentor, async (req, res) => {
  try {
    res.json({
      progressTrends: [
        { name: 'Week 1', avgProgress: 20 },
        { name: 'Week 2', avgProgress: 45 },
        { name: 'Week 3', avgProgress: 70 },
      ],
      weakTopics: [
        { topic: 'State Management', count: 8 },
        { topic: 'Async/Await', count: 5 },
        { topic: 'CSS Grid', count: 3 },
      ],
      insights: [
        '80% of students struggle with Redux logic.',
        'Morning sessions have 20% higher engagement.',
        'Sarah is ahead of schedule by 2 weeks.'
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

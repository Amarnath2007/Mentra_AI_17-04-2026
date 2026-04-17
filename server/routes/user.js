const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

router.get('/profile', auth, async (req, res) => {
  try {
    if (supabase) {
      try {
        const { data: user, error } = await supabase.from('users').select('*, learningPath:learning_paths(*)').eq('id', req.user.id).single();
        if (user && !error) {
          delete user.password;
          // Flatten learningPath if it is an array
          if (Array.isArray(user.learningPath) && user.learningPath.length > 0) {
              user.learningPath = user.learningPath[0];
          }
          return res.json(user);
        }
      } catch(e) {}
    }
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    if (supabase) {
      try {
        const { data: user, error } = await supabase.from('users').update(updates).eq('id', req.user.id).select().single();
        if (user && !error) {
          delete user.password;
          return res.json(user);
        }
      } catch(e) {}
    }
    res.json({ ...req.user, ...updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mentors', auth, async (req, res) => {
  try {
    if (supabase) {
      try {
        const { data: mentors, error } = await supabase.from('users').select('id, name, role, avatar, bio, skills').eq('role', 'mentor').limit(10);
        if (mentors && mentors.length > 0) return res.json(mentors);
      } catch(e) {}
    }
    res.json([
      { id: 'm1', name: 'Dr. Priya Sharma', role: 'mentor', skills: ['React', 'Node.js', 'System Design'], bio: 'Full-stack engineer with 10+ years experience', avatar: '' },
      { id: 'm2', name: 'Arjun Mehta', role: 'mentor', skills: ['Python', 'ML', 'Data Science'], bio: 'AI/ML engineer at a leading tech firm', avatar: '' },
      { id: 'm3', name: 'Fatima Al-Hassan', role: 'mentor', skills: ['UI/UX', 'Figma', 'CSS'], bio: 'Senior product designer with a passion for EdTech', avatar: '' },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notifications/read', auth, async (req, res) => {
  try {
    if (supabase) {
      try {
        const { data: user } = await supabase.from('users').select('notifications').eq('id', req.user.id).single();
        if (user && user.notifications) {
          const updatedNotifications = user.notifications.map(n => ({ ...n, read: true }));
          await supabase.from('users').update({ notifications: updatedNotifications }).eq('id', req.user.id);
        }
      } catch(e) {}
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/progress/complete-topic', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    if (supabase) {
      try {
        const { data: user } = await supabase.from('users').select('progress').eq('id', req.user.id).single();
        if (user && user.progress) {
          const progress = user.progress;
          if (!progress.completedTopics) progress.completedTopics = [];
          if (!progress.completedTopics.includes(topic)) {
            progress.completedTopics.push(topic);
          }
          progress.xpPoints = (progress.xpPoints || 0) + 50;
          progress.lastActive = new Date();

          const { data: updated } = await supabase.from('users').update({ progress }).eq('id', req.user.id).select().single();
          if (updated) return res.json({ success: true, progress: updated.progress });
        }
      } catch(e) {}
    }
    res.json({ success: true, xpEarned: 50 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

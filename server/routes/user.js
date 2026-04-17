const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

// ─── GET /user/profile ───────────────────────────────────────────────────────
router.get('/profile', auth, async (req, res) => {
  try {
    if (supabase) {
      const { data: user, error } = await supabase.from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
      if (user && !error) {
        delete user.password;
        return res.json(user);
      }
    }
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /user/profile ───────────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    if (supabase) {
      const { data: user, error } = await supabase.from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();
      if (user && !error) {
        delete user.password;
        return res.json(user);
      }
    }
    res.json({ ...req.user, ...updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /user/onboarding ──────────────────────────────────────────────────
// Store onboarding answers and mark user as onboarded
router.post('/onboarding', auth, async (req, res) => {
  try {
    const { 
      role, education, skills, experience_level, interests, 
      goals, time_commitment, learning_style, strengths, 
      weaknesses, target_timeline 
    } = req.body;

    const updates = {
      role: role || 'student',
      education: education || '',
      skills: skills || [],
      experience_level: experience_level || 'beginner',
      interests: interests || [],
      goals: goals || '',
      time_commitment: time_commitment || '',
      learning_style: learning_style || '',
      strengths: strengths || '',
      weaknesses: weaknesses || '',
      target_timeline: target_timeline || '',
      onboarding_completed: true,
    };

    if (supabase) {
      const { data: user, error } = await supabase.from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();
      
      if (user && !error) {
        delete user.password;
        return res.json({ success: true, user });
      }
      if (error) {
        console.error('Supabase onboarding error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    res.json({ success: true, user: { ...req.user, ...updates } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /user/notifications/read ──────────────────────────────────────────
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

// ─── PUT /user/progress/complete-topic ──────────────────────────────────────
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
          progress.lastActive = new Date();

          const { data: updated } = await supabase.from('users').update({ progress }).eq('id', req.user.id).select().single();
          if (updated) return res.json({ success: true, progress: updated.progress });
        }
      } catch(e) {}
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

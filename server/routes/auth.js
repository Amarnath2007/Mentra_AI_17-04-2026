const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');

// In-memory fallback store (when DB is unavailable)
const memUsers = [];

const initDemoUsers = async () => {
  const hashed = await bcrypt.hash('demo123', 12);
  memUsers.push({
    id: 'demo-student-id', name: 'Demo Student', email: 'student@mentra.ai', password: hashed, role: 'student',
    skills: [], interests: [], skillLevel: 'beginner', notifications: [],
    progress: { completedTopics: [], totalTopics: 0, xpPoints: 0, streak: 3 }, createdAt: new Date()
  });
  memUsers.push({
    id: 'demo-mentor-id', name: 'Demo Mentor', email: 'mentor@mentra.ai', password: hashed, role: 'mentor',
    skills: ['React', 'Node.js'], interests: [], skillLevel: 'advanced', notifications: [],
    progress: { completedTopics: [], totalTopics: 0, xpPoints: 1500, streak: 12 }, createdAt: new Date()
  });
};
initDemoUsers();

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET || 'fallback_secret',
  { expiresIn: '7d' }
);

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'student', interests = [] } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (supabase) {
      try {
        const { data: existing, error: existErr } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
        if (existing) return res.status(409).json({ error: 'Email already registered' });
        // Optional: you can ignore existErr or just proceed

        const hashed = await bcrypt.hash(password, 12);
        const { data: user, error } = await supabase.from('users').insert([{
          name, email, password: hashed, role, interests
        }]).select().single();

        if (error) throw error;
        
        const token = signToken(user);
        const { password: _, ...safeUser } = user;
        return res.status(201).json({ token, user: safeUser });
      } catch (dbErr) {
        console.warn('DB error, using in-memory:', dbErr.message);
      }
    }

    // Fallback
    const existing = memUsers.find(u => u.email === email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = {
      id: Date.now().toString(), name, email, password: hashed, role,
      skills: [], interests: [], skillLevel: 'beginner', notifications: [],
      progress: { completedTopics: [], totalTopics: 0, xpPoints: 0, streak: 0 }, createdAt: new Date()
    };
    memUsers.push(user);
    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    if (supabase) {
      try {
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (user && !error) {
          const match = await bcrypt.compare(password, user.password);
          if (!match) return res.status(401).json({ error: 'Invalid credentials' });
          const token = signToken(user);
          const { password: _, ...safeUser } = user;
          return res.json({ token, user: safeUser });
        }
      } catch (dbErr) {
        console.warn('DB error, using in-memory:', dbErr.message);
      }
    }

    // Fallback
    const user = memUsers.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

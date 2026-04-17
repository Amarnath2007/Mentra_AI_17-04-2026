const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

// In-memory message store (fallback)
const memMessages = [];

// POST /chat/send
router.post('/send', auth, async (req, res) => {
  try {
    const { room, content } = req.body;
    if (!room || !content) return res.status(400).json({ error: 'Room and content required' });

    const msgData = {
      room,
      sender: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      content,
    };

    if (supabase) {
      try {
        const { data: saved, error } = await supabase.from('messages').insert([msgData]).select().single();
        if (error) throw error;
        // Emit via socket
        req.io?.to(room).emit('message', {
          ...saved,
          sender: { id: req.user.id, name: req.user.name, role: req.user.role }
        });
        return res.status(201).json(saved);
      } catch(e) {}
    }

    const msg = { id: Date.now().toString(), ...msgData, createdAt: new Date() };
    memMessages.push(msg);
    req.io?.to(room).emit('message', msg);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /chat/history/:room
router.get('/history/:room', auth, async (req, res) => {
  try {
    const { room } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (supabase) {
      try {
        const { data: messages, error } = await supabase.from('messages')
          .select('*, senderUser:sender(name, role, avatar)')
          .eq('room', room)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (messages && !error) {
          return res.json(messages.reverse().map(m => ({
              ...m,
              sender: m.senderUser || { name: m.senderName, role: m.senderRole }
          })));
        }
      } catch(e) {}
    }

    const filtered = memMessages.filter(m => m.room === room).slice(-limit);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /chat/rooms
router.get('/rooms', auth, (req, res) => {
  const rooms = [
    { id: 'general', name: 'General Discussion', description: 'Chat about anything tech-related', icon: '💬', members: 128 },
    { id: 'javascript', name: 'JavaScript', description: 'JS, Node.js, React and more', icon: '⚡', members: 94 },
    { id: 'python', name: 'Python', description: 'Python, Django, ML and data science', icon: '🐍', members: 76 },
    { id: 'career', name: 'Career & Jobs', description: 'Resume tips, interview prep, job hunting', icon: '🚀', members: 112 },
    { id: 'ml-ai', name: 'ML & AI', description: 'Machine learning, deep learning, AI', icon: '🤖', members: 88 },
    { id: 'projects', name: 'Show Your Work', description: 'Share and get feedback on your projects', icon: '🎨', members: 65 },
  ];
  res.json(rooms);
});

module.exports = router;

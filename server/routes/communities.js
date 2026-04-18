const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

// ─── POST /communities ────────────────────────────────────────────────────────
// Create a new community
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, topic, icon } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Community name is required' });

    // Create the community
    const { data: community, error } = await supabase.from('communities').insert([{
      name: name.trim(),
      description: description?.trim() || '',
      topic: topic?.trim() || 'General',
      icon: icon || '💬',
      created_by: req.user.id,
      member_count: 1,
    }]).select().single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'A community with this name already exists' });
      throw error;
    }

    // Add creator as admin
    await supabase.from('community_members').insert([{
      user_id: req.user.id,
      community_id: community.id,
      role: 'admin',
    }]);

    res.status(201).json(community);
  } catch (err) {
    console.error('Create community error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /communities ─────────────────────────────────────────────────────────
// List all communities (with optional search)
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('communities').select('*').order('created_at', { ascending: false });

    if (search?.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,topic.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /communities/me ──────────────────────────────────────────────────────
// Get communities the current user has joined
router.get('/me', auth, async (req, res) => {
  try {
    const { data: memberships, error } = await supabase.from('community_members')
      .select('community_id, role, communities(*)')
      .eq('user_id', req.user.id)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    const joined = (memberships || []).map(m => ({
      ...m.communities,
      myRole: m.role,
    }));

    res.json(joined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /communities/:id ─────────────────────────────────────────────────────
// Get a single community by id
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('communities').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Community not found' });

    // Check membership
    const { data: membership } = await supabase.from('community_members')
      .select('role')
      .eq('user_id', req.user.id)
      .eq('community_id', req.params.id)
      .single();

    res.json({ ...data, isMember: !!membership, myRole: membership?.role || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /communities/:id/join ───────────────────────────────────────────────
// Join a community
router.post('/:id/join', auth, async (req, res) => {
  try {
    // Check if already a member
    const { data: existing } = await supabase.from('community_members')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('community_id', req.params.id)
      .single();

    if (existing) return res.json({ message: 'Already a member' });

    await supabase.from('community_members').insert([{
      user_id: req.user.id,
      community_id: req.params.id,
      role: 'member',
    }]);

    // Increment member count
    const { data: community } = await supabase.from('communities').select('member_count').eq('id', req.params.id).single();
    await supabase.from('communities').update({ member_count: (community?.member_count || 0) + 1 }).eq('id', req.params.id);

    res.json({ message: 'Joined successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /communities/:id/leave ──────────────────────────────────────────────
// Leave a community
router.post('/:id/leave', auth, async (req, res) => {
  try {
    await supabase.from('community_members')
      .delete()
      .eq('user_id', req.user.id)
      .eq('community_id', req.params.id);

    // Decrement member count
    const { data: community } = await supabase.from('communities').select('member_count').eq('id', req.params.id).single();
    await supabase.from('communities').update({ member_count: Math.max(0, (community?.member_count || 1) - 1) }).eq('id', req.params.id);

    res.json({ message: 'Left community' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /communities/:id/messages ────────────────────────────────────────────
// Fetch messages for a community
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const { data, error } = await supabase.from('community_messages')
      .select('*')
      .eq('community_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json((data || []).reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /communities/:id/messages ───────────────────────────────────────────
// Send a message in a community
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });

    const { data: msg, error } = await supabase.from('community_messages').insert([{
      community_id: req.params.id,
      user_id: req.user.id,
      user_name: req.user.name,
      content: content.trim(),
    }]).select().single();

    if (error) throw error;

    // Broadcast via socket
    req.io?.to(`community:${req.params.id}`).emit('community:message', msg);

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const jwt = require('jsonwebtoken');

// Track connected users
const connectedUsers = new Map();

const setupSocket = (io) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 ${user.name} connected (${socket.id})`);

    // Track user
    connectedUsers.set(user.id, { socketId: socket.id, name: user.name, role: user.role });
    io.emit('users:online', Array.from(connectedUsers.values()));

    // Join a room
    socket.on('room:join', ({ room }) => {
      socket.join(room);
      socket.to(room).emit('room:user-joined', {
        user: { id: user.id, name: user.name, role: user.role },
        room,
        timestamp: new Date(),
      });
      console.log(`  → ${user.name} joined room: ${room}`);
    });

    // Leave a room
    socket.on('room:leave', ({ room }) => {
      socket.leave(room);
      socket.to(room).emit('room:user-left', {
        user: { id: user.id, name: user.name },
        room,
        timestamp: new Date(),
      });
    });

    // Send message via socket (alternative to REST)
    socket.on('message:send', async ({ room, content }) => {
      if (!room || !content) return;
      const msg = {
        id: Date.now().toString(),
        room,
        sender: { id: user.id, name: user.name, role: user.role },
        senderName: user.name,
        senderRole: user.role,
        content,
        createdAt: new Date(),
      };

      // Save to DB if available
      try {
        const supabase = require('./supabase');
        if (supabase) {
          const { data: saved } = await supabase.from('messages').insert([{
            room, content,
            sender: user.id,
            senderName: user.name,
            senderRole: user.role,
          }]).select().single();
          if (saved) msg.id = saved.id;
        }
      } catch(e) {}

      io.to(room).emit('message', msg);
    });

    // Typing indicators
    socket.on('typing:start', ({ room }) => {
      socket.to(room).emit('typing:start', { user: user.name, room });
    });
    socket.on('typing:stop', ({ room }) => {
      socket.to(room).emit('typing:stop', { user: user.name, room });
    });

    // ─── Community Rooms ──────────────────────────────────────────────
    socket.on('community:join', ({ communityId }) => {
      const room = `community:${communityId}`;
      socket.join(room);
      console.log(`  → ${user.name} joined community room: ${room}`);
    });

    socket.on('community:leave', ({ communityId }) => {
      socket.leave(`community:${communityId}`);
    });

    socket.on('community:send', async ({ communityId, content }) => {
      if (!communityId || !content?.trim()) return;
      const msg = {
        id: Date.now().toString(),
        community_id: communityId,
        user_id: user.id,
        user_name: user.name,
        content: content.trim(),
        created_at: new Date(),
      };

      try {
        const supabase = require('./supabase');
        if (supabase) {
          const { data: saved } = await supabase.from('community_messages').insert([{
            community_id: communityId,
            user_id: user.id,
            user_name: user.name,
            content: content.trim(),
          }]).select().single();
          if (saved) Object.assign(msg, saved);
        }
      } catch(e) { console.error('community msg save error:', e.message); }

      io.to(`community:${communityId}`).emit('community:message', msg);
    });

    // Direct message room helper
    socket.on('dm:join', ({ targetUserId }) => {
      const dmRoom = [user.id, targetUserId].sort().join('__dm__');
      socket.join(dmRoom);
      socket.emit('dm:room', { room: dmRoom });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(user.id);
      io.emit('users:online', Array.from(connectedUsers.values()));
      console.log(`❌ ${user.name} disconnected`);
    });
  });
};

module.exports = setupSocket;

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
// const mongoose = require('mongoose');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');
const mentorRoutes = require('./routes/mentor');
const communityRoutes = require('./routes/communities');
const journeyRoutes = require('./routes/journey');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/ai', aiRoutes);
app.use('/chat', chatRoutes);
app.use('/mentor', mentorRoutes);
app.use('/communities', communityRoutes);
app.use('/journey', journeyRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket setup
setupSocket(io);

// Supabase connection check
const supabase = require('./supabase');
if (supabase) {
  console.log('✅ Supabase configured');
} else {
  console.warn('⚠️  Supabase not configured, running with in-memory fallback');
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Mentra AI Server running on http://localhost:${PORT}`);
});

module.exports = { app, io };

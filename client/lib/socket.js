import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (token) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const joinRoom = (room) => socketRef.current?.emit('room:join', { room });
  const leaveRoom = (room) => socketRef.current?.emit('room:leave', { room });
  const sendMessage = (room, content) => socketRef.current?.emit('message:send', { room, content });
  const startTyping = (room) => socketRef.current?.emit('typing:start', { room });
  const stopTyping = (room) => socketRef.current?.emit('typing:stop', { room });
  const onEvent = (event, cb) => socketRef.current?.on(event, cb);
  const offEvent = (event, cb) => socketRef.current?.off(event, cb);

  return { socket: socketRef.current, connected, onlineUsers, joinRoom, leaveRoom, sendMessage, startTyping, stopTyping, onEvent, offEvent };
};

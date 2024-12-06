// src/atoms/socketAtoms.ts

import { atom } from 'jotai';
import { io, Socket } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BASE_URL_CHAT_EMPLOYER;

export const socketAtom = atom<Socket | null>(null);

export const initializeSocketAtom = atom(
  (get) => get(socketAtom), // Read atom value if available
  (get, set) => {
    const existingSocket = get(socketAtom);
    if (existingSocket) {
      return; // Return early if socket already exists
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Socket can't be initialized without token.");
      return;
    }

    const socket = io(backendUrl, {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    set(socketAtom, socket); // Store the socket in the atom
  }
);

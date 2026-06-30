import type { RoomData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

// Ably só é carregado se a chave existir
let ablyPromise: Promise<any> | null = null;

function getAbly() {
  if (!import.meta.env.VITE_ABLY_KEY) return null;
  if (!ablyPromise) {
    ablyPromise = import('ably').then(({ Realtime }) => {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('userId', userId);
      }
      return new Realtime({
        key: import.meta.env.VITE_ABLY_KEY,
        clientId: userId,
      });
    });
  }
  return ablyPromise;
}

export async function createRoom(
  name: string,
  cards: string[],
  userId: string,
): Promise<{ roomId: string; room: RoomData }> {
  const res = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', name, cards, userId }),
  });
  return res.json();
}

export async function joinRoom(
  roomId: string,
  name: string,
  userId: string,
  isSpectator = false,
): Promise<{ room: RoomData } | { error: string }> {
  const res = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'join', roomId, name, userId, isSpectator }),
  });
  return res.json();
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'leave', roomId, userId }),
  });
}

export async function vote(roomId: string, userId: string, value: string): Promise<void> {
  await fetch(`${API_URL}/api/rooms/${roomId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, value }),
  });
}

export async function revealCards(roomId: string): Promise<void> {
  await fetch(`${API_URL}/api/rooms/${roomId}/reveal`, {
    method: 'POST',
  });
}

export async function resetVotes(roomId: string): Promise<void> {
  await fetch(`${API_URL}/api/rooms/${roomId}/reset`, {
    method: 'POST',
  });
}

export async function subscribeToRoom(
  roomId: string,
  onUpdate: (room: RoomData) => void,
): Promise<() => void> {
  const client = await getAbly();
  if (!client) return () => {};

  const channel = client.channels.get(`room:${roomId}`);
  channel.subscribe('room_update', (msg: any) => {
    onUpdate(msg.data as RoomData);
  });

  return () => {
    channel.unsubscribe();
  };
}

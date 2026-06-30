import { Realtime, type InboundMessage } from 'ably';
import type { RoomData } from '../types';

const ably = new Realtime({
  key: import.meta.env.VITE_ABLY_KEY,
  clientId: localStorage.getItem('userId') || undefined,
});

const API_URL = import.meta.env.VITE_API_URL || '';

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

export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: RoomData) => void,
): () => void {
  const channel = ably.channels.get(`room:${roomId}`);

  channel.subscribe('room_update', (msg: InboundMessage) => {
    onUpdate(msg.data as RoomData);
  });

  return () => {
    channel.unsubscribe();
  };
}

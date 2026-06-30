import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { joinRoom, createRoom, vote, revealCards, resetVotes, subscribeToRoom, leaveRoom } from '../services/realtime';
import type { RoomData } from '../types';
import RoomHeader from '../components/RoomHeader';
import PokerTable from '../components/PokerTable';
import RoomControls from '../components/RoomControls';
import VotingDeck from '../components/VotingDeck';

export default function Room() {
  const { id: roomId } = useParams();
  const location = useLocation();
  const [name, setName] = useState(() => {
    return location.state?.name || localStorage.getItem(`room_${roomId}_name`) || '';
  });
  const [hasJoined, setHasJoined] = useState(() => {
    return !!(location.state?.name || localStorage.getItem(`room_${roomId}_name`));
  });
  const [userId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userId', id);
    }
    return id;
  });
  const [room, setRoom] = useState<RoomData | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const isRestoringRoom = useRef(false);

  useEffect(() => {
    if (!name || !hasJoined || !roomId) {
      return;
    }

    const roomSnapshotKey = `room_${roomId}_snapshot`;
    const saveRoomSnapshot = (roomData: RoomData) => {
      localStorage.setItem(roomSnapshotKey, JSON.stringify({ cards: roomData.cards }));
    };

    const restoreRoom = async (cards: string[]) => {
      if (isRestoringRoom.current) return;
      isRestoringRoom.current = true;

      try {
        const response = await createRoom(name, cards, userId);
        if (response.room) {
          setRoom(response.room);
          setMyVote(null);
          saveRoomSnapshot(response.room);
          localStorage.setItem(`room_${roomId}_name`, name);
        } else {
          alert('Nao foi possivel restaurar a sala automaticamente.');
        }
      } catch {
        alert('Nao foi possivel restaurar a sala automaticamente.');
      } finally {
        isRestoringRoom.current = false;
      }
    };

    const join = async () => {
      try {
        const response = await joinRoom(roomId, name, userId);
        if ('room' in response && response.room) {
          isRestoringRoom.current = false;
          setRoom(response.room);
          saveRoomSnapshot(response.room);
          localStorage.setItem(`room_${roomId}_name`, name);
        } else if ('error' in response && response.error === 'Room not found') {
          const savedSnapshot = localStorage.getItem(roomSnapshotKey);
          if (savedSnapshot) {
            try {
              const parsedSnapshot = JSON.parse(savedSnapshot) as { cards?: string[] };
              if (parsedSnapshot.cards?.length) {
                restoreRoom(parsedSnapshot.cards);
                return;
              }
            } catch {
              localStorage.removeItem(roomSnapshotKey);
            }
          }
          alert('Sala nao encontrada!');
        } else {
          alert('Nao foi possivel entrar na sala.');
        }
      } catch {
        alert('Nao foi possivel entrar na sala.');
      }
    };

    const handleRoomUpdate = (updatedRoom: RoomData) => {
      setRoom(updatedRoom);
      saveRoomSnapshot(updatedRoom);
      if (!updatedRoom.areCardsRevealed && updatedRoom.players.find(p => p.userId === userId)?.vote === null) {
        setMyVote(null);
      }
    };

    let cleanupFn: (() => void) | null = null;

    join();
    subscribeToRoom(roomId, handleRoomUpdate).then((unsub) => {
      cleanupFn = unsub;
    });

    return () => {
      cleanupFn?.();
      leaveRoom(roomId, userId);
    };
  }, [name, roomId, hasJoined, userId]);

  const handleVote = async (value: string) => {
    if (room?.areCardsRevealed) return;
    setMyVote(value);
    await vote(roomId!, userId, value);
  };

  const handleReveal = async () => {
    await revealCards(roomId!);
  };

  const handleReset = async () => {
    await resetVotes(roomId!);
    setMyVote(null);
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark to-surface p-4">
        <div className="max-w-md w-full bg-surface/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Entrar na Sala</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) setHasJoined(true); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Seu Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Digite seu nome..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!room) return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;

  const average = room.areCardsRevealed
    ? (room.players.reduce((acc, p) => acc + (parseFloat(p.vote || '0') || 0), 0) / room.players.filter(p => p.vote && !isNaN(parseFloat(p.vote))).length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-dark text-white p-4 md:p-8">
      <RoomHeader roomId={roomId || ''} playerCount={room.players.length} />

      <div className="max-w-4xl mx-auto mb-12">
        <PokerTable
          players={room.players}
          areCardsRevealed={room.areCardsRevealed}
          average={average}
        />

        <RoomControls
          onReveal={handleReveal}
          onReset={handleReset}
          areCardsRevealed={room.areCardsRevealed}
        />

        <VotingDeck
          cards={room.cards}
          myVote={myVote}
          areCardsRevealed={room.areCardsRevealed}
          onVote={handleVote}
        />
      </div>
    </div>
  );
}

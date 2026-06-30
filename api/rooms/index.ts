import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../_lib/redis';
import { publishRoomUpdate } from '../_lib/ably';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, roomId: requestedRoomId, name, cards, userId, isSpectator } = req.body;

    if (action === 'create' || action === 'join') {
      const roomId = requestedRoomId || Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingRoom = await getRoom(roomId);

      if (action === 'create') {
        if (existingRoom) {
          let player = existingRoom.players.find((p: any) => p.userId === userId);
          if (player) {
            player.id = `http_${userId}`;
            player.name = name;
            player.isSpectator = false;
          } else {
            existingRoom.players.push({
              id: `http_${userId}`,
              userId,
              name,
              vote: null,
              isSpectator: false,
            });
          }
          await saveRoom(existingRoom);
          await publishRoomUpdate(roomId, existingRoom);
          return res.status(200).json({ roomId, room: existingRoom });
        }

        const room = {
          id: roomId,
          players: [{
            id: `http_${userId}`,
            userId,
            name,
            vote: null,
            isSpectator: false,
          }],
          cards,
          areCardsRevealed: false,
          adminId: `http_${userId}`,
        };

        await saveRoom(room);
        await publishRoomUpdate(roomId, room);
        return res.status(200).json({ roomId, room });
      }

      if (action === 'join') {
        if (!existingRoom) {
          return res.status(200).json({ error: 'Room not found' });
        }

        let player = existingRoom.players.find((p: any) => p.userId === userId);
        if (player) {
          player.id = `http_${userId}`;
          player.name = name;
          player.isSpectator = isSpectator;
        } else {
          existingRoom.players.push({
            id: `http_${userId}`,
            userId,
            name,
            vote: null,
            isSpectator,
          });
        }

        await saveRoom(existingRoom);
        await publishRoomUpdate(roomId, existingRoom);
        return res.status(200).json({ room: existingRoom });
      }
    }

    if (action === 'leave') {
      const roomId = requestedRoomId;
      if (!roomId || !userId) {
        return res.status(400).json({ error: 'Missing roomId or userId' });
      }

      const room = await getRoom(roomId);
      if (!room) {
        return res.status(200).json({ error: 'Room not found' });
      }

      room.players = room.players.filter((p: any) => p.userId !== userId);

      if (room.players.length === 0) {
        return res.status(200).json({ room: null });
      }

      if (room.adminId === `http_${userId}`) {
        room.adminId = room.players[0].id;
      }

      await saveRoom(room);
      await publishRoomUpdate(roomId, room);
      return res.status(200).json({ room });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (e) {
    console.error('Rooms API error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

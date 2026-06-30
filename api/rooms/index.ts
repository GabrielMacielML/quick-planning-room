import { getRoom, saveRoom } from '../_lib/redis';
import { publishRoomUpdate } from '../_lib/ably';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action, roomId: requestedRoomId, name, cards, userId, isSpectator } = await req.json();

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
          return new Response(JSON.stringify({ roomId, room: existingRoom }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
        return new Response(JSON.stringify({ roomId, room }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'join') {
        if (!existingRoom) {
          return new Response(JSON.stringify({ error: 'Room not found' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
        return new Response(JSON.stringify({ room: existingRoom }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'leave') {
      const roomId = requestedRoomId;
      if (!roomId || !userId) {
        return new Response(JSON.stringify({ error: 'Missing roomId or userId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const room = await getRoom(roomId);
      if (!room) {
        return new Response(JSON.stringify({ error: 'Room not found' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      room.players = room.players.filter((p: any) => p.userId !== userId);

      if (room.players.length === 0) {
        return new Response(JSON.stringify({ room: null }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (room.adminId === `http_${userId}`) {
        room.adminId = room.players[0].id;
      }

      await saveRoom(room);
      await publishRoomUpdate(roomId, room);
      return new Response(JSON.stringify({ room }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Rooms API error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

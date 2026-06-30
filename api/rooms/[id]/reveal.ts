import { getRoom, saveRoom } from '../../_lib/redis';
import { publishRoomUpdate } from '../../_lib/ably';

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
    const url = new URL(req.url);
    const id = url.pathname.split('/').filter(Boolean).pop();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing roomId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const room = await getRoom(id);
    if (!room) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    room.areCardsRevealed = true;
    await saveRoom(room);
    await publishRoomUpdate(id, room);

    return new Response(JSON.stringify({ room }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Reveal error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../_lib/redis';
import { publishRoomUpdate } from '../../_lib/ably';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing roomId' });
  }

  try {
    const room = await getRoom(id as string);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.areCardsRevealed = true;
    await saveRoom(room);
    await publishRoomUpdate(id as string, room);

    return res.status(200).json({ room });
  } catch (e) {
    console.error('Reveal error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

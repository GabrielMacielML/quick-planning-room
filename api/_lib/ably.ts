import Ably from 'ably';

let client: Ably.Rest | null = null;
if (process.env.ABLY_API_KEY) {
  try {
    client = new Ably.Rest(process.env.ABLY_API_KEY);
  } catch (e) {
    console.error('Failed to init Ably:', e);
  }
}

export async function publishRoomUpdate(roomId: string, room: any) {
  if (!client) return;
  try {
    const channel = client.channels.get(`room:${roomId}`);
    await channel.publish('room_update', room);
  } catch (e) {
    console.error('Failed to publish Ably update:', e);
  }
}

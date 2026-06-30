import Ably from 'ably';

let client: Ably.Rest | null = null;
if (process.env.ABLY_API_KEY) {
  client = new Ably.Rest(process.env.ABLY_API_KEY);
}

export async function publishRoomUpdate(roomId: string, room: any) {
  if (!client) return;
  const channel = client.channels.get(`room:${roomId}`);
  await channel.publish('room_update', room);
}

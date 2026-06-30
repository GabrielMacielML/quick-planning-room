import Ably from 'ably';

const client = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function publishRoomUpdate(roomId: string, room: any) {
  const channel = client.channels.get(`room:${roomId}`);
  await channel.publish('room_update', room);
}

const ABLY_KEY = process.env.ABLY_API_KEY;

export async function publishRoomUpdate(roomId: string, room: any) {
  if (!ABLY_KEY) return;
  try {
    const channelName = `room:${roomId}`;
    const url = `https://rest.ably.io/channels/${encodeURIComponent(channelName)}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(ABLY_KEY)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'room_update',
        data: room,
      }),
    });
  } catch (e) {
    console.error('Ably publish error:', e);
  }
}

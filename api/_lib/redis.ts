import { Redis } from '@upstash/redis/dist/edge';

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let redis: Redis | null = null;
if (hasUpstash) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const localRooms: Record<string, any> = {};

export async function getRoom(roomId: string) {
  if (redis) {
    const data = await redis.get(`room:${roomId}`);
    return data as any;
  }
  return localRooms[roomId] || null;
}

export async function saveRoom(room: any) {
  if (redis) {
    await redis.set(`room:${room.id}`, JSON.stringify(room), { ex: 86400 });
  } else {
    localRooms[room.id] = room;
  }
}

export async function deleteRoom(roomId: string) {
  if (redis) {
    await redis.del(`room:${roomId}`);
  } else {
    delete localRooms[roomId];
  }
}

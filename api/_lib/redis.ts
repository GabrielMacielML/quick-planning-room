import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getRoom(roomId: string) {
  const data = await redis.get(`room:${roomId}`);
  return data as any;
}

export async function saveRoom(room: any) {
  await redis.set(`room:${room.id}`, JSON.stringify(room), { ex: 86400 });
}

export async function deleteRoom(roomId: string) {
  await redis.del(`room:${roomId}`);
}

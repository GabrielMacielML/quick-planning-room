import { createClient } from 'redis';
import { Room } from '../types';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const localRooms: Record<string, Room> = {};

export async function initRedis() {
    if (process.env.REDIS_URL) {
        await redisClient.connect();
        console.log('Connected to Redis');
    } else {
        console.log('Running without Redis (Memory Mode)');
    }
}

export async function getRoom(roomId: string): Promise<Room | null> {
    if (redisClient.isOpen) {
        const data = await redisClient.get(`room:${roomId}`);
        return data ? JSON.parse(data) : null;
    }
    return localRooms[roomId] || null;
}

export async function saveRoom(room: Room) {
    if (redisClient.isOpen) {
        await redisClient.set(`room:${room.id}`, JSON.stringify(room), {
            EX: 86400
        });
    } else {
        localRooms[room.id] = room;
    }
}

export async function deleteRoom(roomId: string) {
    if (redisClient.isOpen) {
        await redisClient.del(`room:${roomId}`);
    } else {
        delete localRooms[roomId];
    }
}

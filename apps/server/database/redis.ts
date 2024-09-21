import { createClient, RedisClientType } from 'redis';
import { env } from '../env';
import { prisma } from '.';

class InternalRedisConnection {
  // Define the type for the _redisConnection property
  private static _redisConnection: RedisClientType | null = null;

  // Define the type for the return value of getRedisConnection
  static getRedisConnection = async (): Promise<RedisClientType> => {
    if (this._redisConnection) {
      return this._redisConnection;
    }

    // Create a new client and connect it, ensuring correct type assignment
    const client: RedisClientType = createClient(
      {
        socket: {
          host: '127.0.0.1',
          port: 6379
        }
      }
    );
    this._redisConnection = await client.connect();
    return this._redisConnection;
  };

  static init = async () => {
    const connection = await this.getRedisConnection()

    const posts = await prisma.post.findMany({
      select: {
        id: true,
        priceMin: true,
        endTime: true,
        bidIncrement: true,
        Bids: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    // Iterate over posts and set values in Redis
    for (const post of posts) {
      const minPrice = post.Bids?.[0]?.amount ?? post.priceMin;
      const { endTime, bidIncrement } = post;

      await connection.set(`post:${post.id}`, JSON.stringify({
        currentBid: minPrice,
        endTime,
        bidIncrement
      }));
    }

    console.log("Redis Initialized")
  };
}

export { InternalRedisConnection }; // Ensure to export

import { promisify } from 'util';
import { createClient } from 'redis';

const client = createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST_NAME,
  {
    auth_pass: process.env.REDIS_ACCESS_KEY,
    tls: { servername: process.env.REDIS_HOST_NAME },
  }
);
client.on("error", (ex : Error) => {
  console.log("redis: error occured", ex);
});
client.on("reconnecting", () => {
  console.log("redis: reconnecting lost connection");
});
client.on("ready", () => {
  console.log("redis: connection ready");
});

export type RedisSortedSetMember = {
  score: number,
  value: string
}

const zRangeByScoreAsync = promisify(client.zrangebyscore).bind(client);
const zRemRangeByScoreAsync = promisify(client.zremrangebyscore).bind(client);

export const getLatestPatches = async(zSetKey : string, ackTs : number | undefined) : Promise<string[]> => {
  // If ackTs is not provided get the whole Sorted Set (-infinity to infinity)
  const minBounds : string = (ackTs != undefined
    ? `(${ackTs}`
    : ' -inf'
  );

  return zRangeByScoreAsync(zSetKey, minBounds, 'inf', 'withscores');
}

export const removeOlderPatches = async (zSetKey : string, ackTs : number) : Promise<number>  => {
  return zRemRangeByScoreAsync(zSetKey, '-inf', ackTs);
}

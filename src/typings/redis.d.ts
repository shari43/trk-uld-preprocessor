import { EventEmitter } from "stream";

declare module "redis" {
	export function createClient(port_arg, host_arg, options: any) : RedisClient;
	
	interface RedisClient extends EventEmitter {
		// event: connect
		// event: error
		// event: message
		// event: pmessage
		// event: subscribe
		// event: psubscribe
		// event: unsubscribe
		// event: punsubscribe
	
		end();

		// Connection (http://redis.io/commands#connection)
		auth(password: string, callback?: (err: Error, reply: any) => void);
		ping(callback?: (err: Error, reply: number) => void);

		// Strings (http://redis.io/commands#strings)
		append(key: string, value: string, callback?: (err: Error, reply: number) => void);
		bitcount(key: string, callback?: (err: Error, reply: number) => void);
		bitcount(key: string, start: number, end:number, callback?: (err: Error, reply: number) => void);
		set(key: string, value: string, callback?: (err: Error, reply: string) => void);
		get(key: string, callback?: (err: Error, reply: string) => void);
		exists(key: string, value: string, callback?: (err: Error, reply: number) => void);
		
		zrangebyscore(key: string, min: number | string, max: number | string, withscores?: string, callback?: (err: Error, reply: string[]) => void);
		zremrangebyscore(key: string, min: string | number, max: string | number, callback?: (err: Error, reply: number) => void);
		
		connected: bool;
		retry_delay: number;
		retry_backoff: number;
		command_queue: any[];
		offline_queue: any[];
		server_info: { redis_version: string, versions: number[] };
	}
}
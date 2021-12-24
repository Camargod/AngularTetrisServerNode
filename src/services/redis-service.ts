import { RedisClient } from "redis";
import { Service } from "typedi/types/decorators/service.decorator";

@Service()
export class RedisService{
    private redisClient ?: RedisClient;

    publishMessage(socketId:string, value:string){
        let key = this.setMessageKeyBySocketId(socketId);
        this.redisClient?.set(key,value)
    }

    setRedisClient(redisClient : RedisClient){
        this.redisClient = redisClient;
    }

    private setMessageKeyBySocketId(socketId : string){
        return `TetrisVerse:${socketId}`;
    }
}
import 'reflect-metadata';

import {Server, Socket} from 'socket.io';
import * as http from 'http';
import { GameService } from './modules/game-service';
import Container, { Service } from 'typedi';
import { createClient, RedisClient }  from "redis";
import { Observable } from 'rxjs';
import { RedisService } from './services/redis-service';
import * as parser from './socket/parser/socket-parser';
@Service()
export class Main{

    private httpServer ?: http.Server;
    private io ?: Server;
    private pubClient ?: RedisClient;
    private subClient ?: RedisClient;

    private PORT = 3000;
    constructor(private gameService : GameService, private redisService : RedisService){}

    async start(){
        this.attachSocketIo();
        this.gameService.setSocketIo(this.io!)
        await this.gameService.gameStart();
    }

    private attachSocketIo(){
        this.httpServer = http.createServer();
        this.httpServer.listen(process.env.PORT || this.PORT);
 

        this.io = new Server(this.httpServer, {
            cors: {
              origin: "*",
              methods: ["GET", "POST"]
            },
            parser: parser
        });

        // try{
        //     this.pubClient = createClient({ host: "localhost", port: 6379 });
        //     this.subClient = this.pubClient.duplicate();
        //     this.redisService.setRedisClient(this.pubClient);
        // }catch(err){
        //     console.error("Redis não disponivel");
        // }finally{
        //     this.io.adapter(createAdapter(this.pubClient, this.subClient));
        // }
    }
}

const serviceInstance = Container.get(Main);

let main = async () => {
    await serviceInstance.start();
} 

main().then(()=>{
    console.log("Jogo finalizado");
    process.exit(0);
});

import 'reflect-metadata';

import {Server, Socket} from 'socket.io';
import * as http from 'http';
import { GameService } from './modules/game-service';
import Container, { Service } from 'typedi';
import { createAdapter } from '@socket.io/redis-adapter';
const { createClient } = require("redis");

@Service()
export class Main{

    private httpServer ?: http.Server;
    private io ?: Server;

    private PORT = 3000;
    constructor(private gameService : GameService){}

    async start(){
        this.attachSocketIo();
        this.gameService.setSocketIo(this.io!)
        await this.gameService.gameStart();
    }

    private attachSocketIo(){
        this.httpServer = http.createServer();
        const pubClient = createClient({ host: "localhost", port: 6379 });
        const subClient = pubClient.duplicate();
        
        this.httpServer.listen(this.PORT);
 
        this.io = new Server(this.httpServer, {
            cors: {
              origin: "*",
              methods: ["GET", "POST"]
            }
        });
        this.io.adapter(createAdapter(pubClient, subClient));

    }
}

const serviceInstance = Container.get(Main);

let main = async () => {
    await serviceInstance.start();
} 

main().then(()=>{
    console.log("Jogo finalizado")
});

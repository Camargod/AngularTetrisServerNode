import 'reflect-metadata';

import {Server, Socket} from 'socket.io';
import * as http from 'http';
import { GameService } from './modules/game-service';
import Container, { Service } from 'typedi';

@Service()
export class Main{

    private httpServer ?: http.Server;
    private io ?: Server;

    private PORT = 3000;
    constructor(private gameService : GameService){}

    async start(){
        this.attachSocketIo();
        this.gameService.setSocketIo(this.io!)
        this.gameService.gameStart();
    }

    private attachSocketIo(){
        this.httpServer = http.createServer();
        this.httpServer.listen(this.PORT);

        this.io = new Server(this.httpServer, {
            cors: {
              origin: "*",
              methods: ["GET", "POST"]
            }
        });
    }
}

const serviceInstance = Container.get(Main);

let main = async () => {
    await serviceInstance.start();
} 

main().then(()=>{
    console.log("Jogo finalizado")
});

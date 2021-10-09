import 'reflect-metadata';

import {Server, Socket} from 'socket.io';
import * as http from 'http';
import { GameService } from './modules/game';
import Container, { Service } from 'typedi';

@Service()
export class Main{

    private httpServer ?: http.Server;
    private io ?: Server;

    private PORT = 3000;
    constructor(private gameService : GameService){}

    start(){
        this.attachSocketIo();
        this.listen();
        this.gameService.instanceExists();
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

    private listen(){
        this.io!.on('connection', function (socket : Socket){
            console.log("Player conectou");
            console.log(socket)
            socket.on("event", (data) => {
                console.log(socket.id);
                console.log(data);
            })
        })
    }
}

const serviceInstance = Container.get(Main);

serviceInstance.start();

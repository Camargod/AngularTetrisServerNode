
import {Server, Socket} from 'socket.io';
import * as http from 'http';

export class Main{

    private httpServer ?: http.Server;
    private io ?: Server;

    private PORT = 3000;
    constructor(){
       this.attachSocketIo();
       this.listen();
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
            socket.on("event", data => {
                console.log(data);
            })
        })
    }
}

export default new Main();
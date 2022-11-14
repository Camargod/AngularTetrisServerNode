import { Server, Socket } from "socket.io";
import { Service } from "typedi";
import { SocketEventClientEnumerator, SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { TimerService } from "../modules/timer-service";
import { UsersService } from "../modules/users-service";

@Service()
export class SocketEventHandlingMappingService{

    private socketIoServer !: Server;
    private clientMethodMapping : Map<String,Function> = new Map();
    private clientMethodListing = [
        this.handleGridChanges
        , this.void
        , this.playerLost
        , this.userStartSession
        , this.queryFocus
        , this.playerAttacked
        , this.playerSentCardToEnemy
    ]
    constructor(
        private userService : UsersService,
        private timerService : TimerService
    ){}

    emitMessage(event:string | SocketEventServerEnumerator,message : any){
        if(this.socketIoServer) this.socketIoServer.emit(`${event}`,message)
        // console.log(`Mensagem com id: ${event} valor: ${message}`);
    }
    /*
        Emits a message to a single socket;
    */
    emitMessageToSocket(event:string | SocketEventServerEnumerator ,message : any, socket : Socket){
        socket.emit(`${event}`,message);
        console.log(`Mensagem com id: ${event} valor: ${message} para usuário ${socket.id}`);
    }

    setSocketIo(socketIo : Server){
        this.socketIoServer = socketIo;
    }

    validateString(item : (string | number)){
        if(typeof item === 'string')
        {
            if(!isNaN(Number.parseInt(item))){
                return false;
            }
            return true
        }
        return false;
    }

    void(...args : any[]){}

    handleGridChanges(...args : any[]){
        this.userService.setUserGameGrid(args[0],args[1]);
    }

    userStartSession(...args : any[]){
        this.userService.addUser(args[0],args[1]);
    }

    playerLost(...args : any[]){
        this.userService.userLost(args[0],args[1]);
    }

    queryFocus(...args: any[]){
        this.userService.getFocusByType(args[0],args[1]);
    }

    playerAttacked(...args : any[]){
        this.userService.sendDamageEvent(args[0],args[1]);
    }

    playerSentCardToEnemy(...args : any[]){
        this.userService.sendCardEvent(args[0],args[1]);
    }

    setSocketListening(){
        let initializeContext = this.socketInitializer.bind(this);
        this.socketIoServer!.on('connection', function (socket : Socket){
            initializeContext(socket);
        })
    }

    socketInitializer(socket : Socket){
        if(this.timerService.isEnabled.value){
            const e = SocketEventClientEnumerator;
            console.log(`Player com o ID: ${socket.id} conectou`);
            let i = 0;
            for(const eIt in e){
                if(this.validateString(eIt)){
                    this.clientMethodMapping.set(eIt,this.clientMethodListing[i]);
                    console.log(`Evento de id ${eIt} mapeado`);
                    socket.on(eIt,(value)=>{
                        this.clientMethodMapping.get(eIt)?.bind(this)(value,socket);
                    })
                    i++;
                }
            }
            this.emitMessageToSocket(SocketEventServerEnumerator.CONNECTION_READY,"",socket);
            this.userService.addSocketInMap(socket);
        } else{
            //Todo: colocar enum de partida ja inciada e mostrar mensagem no front
        }
        socket.onAny((eventName)=>{
            console.log("EVENTO RECEBIDO: " + eventName);
        })
    }
}



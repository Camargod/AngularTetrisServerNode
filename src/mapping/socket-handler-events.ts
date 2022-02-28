import { Server, Socket } from "socket.io";
import { Service } from "typedi";
import { SocketEventClientEnumerator, SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { UsersService } from "../modules/users-service";

@Service()
export class SocketEventHandlingMappingService{

    private socketIoServer !: Server;
    private clientMethodMapping : Map<String,Function> = new Map();
    private clientMethodListing = [this.handleGridChanges,this.void,this.void,this.userStartSession]
    constructor(
        private userService : UsersService
    ){}

    emitMessage(event:string | SocketEventServerEnumerator,message : any){
        this.socketIoServer.emit(`${event}`,message)
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
        args[2].userService.setUserGameGrid(args[0],args[1]);
    }

    userStartSession(...args : any[]){
        args[2].userService.addUser(args[0],args[1]);
    }

    setSocketListening(){
        let initializeContext = this.socketInitializer.bind(this);
        this.socketIoServer!.on('connection', function (socket : Socket){
            initializeContext(socket);
        })
    }

    socketInitializer(socket : Socket){
        const e = SocketEventClientEnumerator;
        console.log(`Player com o ID: ${socket.id} conectou`);
        let i = 0;
        for(const eIt in e){
            if(this.validateString(eIt)){
                this.clientMethodMapping.set(eIt,this.clientMethodListing[i]);
                console.log(`Evento de id ${eIt} mapeado`);
                socket.on(eIt,(value)=>{
                    console.log(eIt + " Chamado")
                    this.clientMethodMapping.get(eIt)!(value,socket,this);
                })
                i++;
            }
        }
        this.emitMessageToSocket(SocketEventServerEnumerator.CONNECTION_READY,"",socket);
    }
}



import { Server, Socket } from "socket.io";
import { Service } from "typedi";
import { SocketEventClientEnumerator } from "../enums/socket-event.enum";
import { UsersService } from "../modules/users-service";

@Service()
export class SocketEventHandlingMappingService{

    private socketIoServer !: Server;
    private methodMapping : Map<String,Function> = new Map();
    private methodListing = [this.handleGridChanges,this.void,this.void,this.userStartSession]
    constructor(
        private userService : UsersService
    ){}



    emitMessage(event:string,message : any){
        this.socketIoServer.emit(event,message)
        console.log(`Mensagem com id: ${event} valor: ${message}`);
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
        console.log(args[0]);
        args[2].userService.setUserGameGrid(args[0],args[1]);
    }

    userStartSession(...args : any[]){
        args[2].userService.addUser(args[0],args[1]);
    }

    setSocketListening(){
        const e = SocketEventClientEnumerator;
        const classInstance = this;
        this.socketIoServer!.on('connection', function (socket : Socket){
            console.log(`Player com o ID: ${socket.id} conectou`);
            let i = 0;
            for(const eIt in e){
                if(classInstance.validateString(eIt)){
                    classInstance.methodMapping.set(eIt,classInstance.methodListing[i]);
                    console.log(`Evento de id ${eIt} mapeado`);
                    socket.on(eIt,(value)=>{
                        classInstance.methodMapping.get(eIt)!(value,socket,classInstance);
                    })
                    i++;
                }
            }
        })
    }

}


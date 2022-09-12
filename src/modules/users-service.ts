import { BehaviorSubject } from "rxjs";
import { Socket } from "socket.io";
import Container, { Service } from "typedi";
import { TetrisGridPiece } from "../entity/tetris-grid";
import { User } from "../entity/user";
import { UserTransaction } from "../entity/user-transaction";
import focusFilter from "../enums/focus-modes";
import { SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { TimerService } from "./timer-service";

@Service()
export class UsersService{
    private users : Array<User> = [];
    private socketMap : Map<String,Socket> = new Map();
    public alivePlayers = new BehaviorSubject(0);
    constructor(        
        private socketHandler : SocketEventHandlingMappingService
    ) {}

    addUser(userId : string,socket : Socket){
        let timerService = Container.get(TimerService);
        if(userId != null && timerService.isEnabled){
            let user = this.users.find(user => user.userId == userId);
            if(user){
                user.socketId = socket.id;
            }
            else{
                this.users.push(new User(userId,socket.id));
                console.log(`Jogador ${userId} autenticado`);
                //this.setUserGameGrid(new Array<TetrisGridPiece>(),socket);
                this.returnAllGrids();
            }
            this.alivePlayers.next(this.users.length);
        }
        else {
            console.error(`Jogador sem usuário tentou conectar :)`)
        }
    }

    userLost(userId : string,socket : Socket){
        let user = this.users.find(user => user.socketId == socket.id);
        if(user) user.deafeated = true;
        let alive = this.users.filter(user => !user.deafeated);
        this.alivePlayers.next(alive.length);
    }

    setUserGameGrid(grid : Array<TetrisGridPiece>, socket : Socket){
        const user = this.findUserBySocket(socket);
        if(!user){
            console.warn("Unauthenticated player")
        } else{
            user!.playerGrid = grid;
            console.log(`Jogador ${user.userId} atualizou a grid, tamanho da grid: ${user.playerGrid.length}`);
            Container.get(SocketEventHandlingMappingService).emitMessage(`${SocketEventServerEnumerator.CHALLENGER_GRID_UPDATE}`,user);
        }
    }

    returnAllGrids(){
        Container.get(SocketEventHandlingMappingService).emitMessage(`${SocketEventServerEnumerator.ALL_CHALLENGER_GRID}`,this.users);
    }
    
    getPlayersNumber(){
        return this.users.length;
    }

    getFocusByType(type : string, socket : Socket){
        const socketHandling = Container.get(SocketEventHandlingMappingService);
        const userTransaction = this.getUserTransaction(socket);
        let userToFocus = focusFilter(userTransaction.otherUsers,type);
        if(userTransaction.user.focusing && userTransaction.user.focusing != userToFocus.socketId){
            this.users.find((user)=>{
                if(user.socketId == userTransaction.user.focusing){
                    user.attackers.find((userId,index)=>{
                        if(userId == userTransaction.user.socketId){
                            user.attackers.splice(index,1);
                        }
                    })
                } 
            })
            userTransaction.user.focusing = undefined;
        }
        userTransaction.user.focusing = userToFocus.socketId;
        userToFocus.attackers.push(userTransaction.user.socketId);
        socketHandling.emitMessageToSocket(SocketEventServerEnumerator.FOCUSING_PLAYERS,userToFocus.socketId,socket);
        // socketHandling.emitMessageToSocket(SocketEventServerEnumerator.GETTING_FOCUSED,userTransaction.user.socketId,userTransaction.user.focusing.socket);
    }

    getUserTransaction(socket : Socket) : UserTransaction{
        const user = this.findUserBySocket(socket);
        const otherUsers = this.getListWithoutRequestedUser(socket);
        return {user:user!,otherUsers:otherUsers};
    }

    sendDamageEvent(damage : number,socket : Socket){
        const socketHandling = Container.get(SocketEventHandlingMappingService);
        const user = this.findUserBySocket(socket);
        if(user?.attackers.length && user.attackers.length > 0) damage *= user.attackers.length;
        const focusing = this.socketMap.get(user?.focusing!);
        if(focusing){
            socketHandling.emitMessageToSocket(SocketEventServerEnumerator.RECEIVED_DAMAGE,damage,focusing);
        }
    }

    addSocketInMap(socket : Socket){
        this.socketMap.set(socket.id,socket);
    }

    private findUserBySocket(socket : Socket){
        return this.users.find((user)=>{
            return user.socketId == socket.id
        });
    }

    private findUserBySocketId(socketId : String){
        return this.users.find((user)=>{
            return user.socketId == socketId
        });
    }

    private getListWithoutRequestedUser(socket : Socket) : Array<User>{
        return this.users.filter((user)=>{
            return user.socketId != socket.id;
        })
    }

    // private getSocketBy
}
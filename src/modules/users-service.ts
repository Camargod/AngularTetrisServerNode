import { BehaviorSubject } from "rxjs";
import { Socket } from "socket.io";
import Container, { Service } from "typedi";
import { Card, cards } from "../entity/cards";
import { TetrisGridPiece } from "../entity/tetris-grid";
import { User } from "../entity/user";
import { UserTransaction } from "../entity/user-transaction";
import focusFilter from "../enums/focus-modes";
import { SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { CardGen } from "./card-gen/card-gem.service";
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
        let alive = this.getAlivePlayers();
        this.alivePlayers.next(alive.length);
        Container.get(SocketEventHandlingMappingService).emitMessage(SocketEventServerEnumerator.ALIVE_PLAYERS,this.alivePlayers.next);
        if(this.alivePlayers.value == 1){
            Container.get(SocketEventHandlingMappingService).emitMessageToSocket(SocketEventServerEnumerator.YOU_WIN, "", this.socketMap.get(alive[0].socketId)!)
        }
    }

    getAlivePlayers(){
        return this.users.filter(user => !user.deafeated);
    }

    setUserGameGrid(grid : Array<TetrisGridPiece>, socket : Socket){
        const user = this.findUserBySocket(socket);
        if(!user){
            console.warn("Unauthenticated player")
        } else{
            user!.playerGrid = grid;
            user!.playedRounds++;
            if(user!.playedRounds % 10 == 0){
                Container.get(SocketEventHandlingMappingService).emitMessageToSocket(`${SocketEventServerEnumerator.GET_CARD_RETURN}`,cards[Container.get(CardGen).shuffle()[0]],socket);
            }
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
        if(userTransaction.user && userTransaction.user.focusing && userTransaction.user.focusing != userToFocus.socketId){
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
        // if(user?.attackers.length && user.attackers.length > 0) damage *= user.attackers.length;
        const focusing = this.socketMap.get(user?.focusing!);
        if(focusing){
            socketHandling.emitMessageToSocket(SocketEventServerEnumerator.RECEIVED_DAMAGE,damage,focusing);
            socketHandling.emitMessageToSocket(SocketEventServerEnumerator.ATTACKED_BY,user?.socketId,focusing);
        }
    }

    sendCardEvent(card: Card, socket : Socket){
        const user = this.findUserBySocket(socket);
        const socketHandling = Container.get(SocketEventHandlingMappingService);
        if(user && user.attackers.length > 0){
            user.attackers.forEach((attacker)=>{
                let attackerSocket = this.socketMap.get(attacker);
                if(attackerSocket){
                    socketHandling.emitMessageToSocket(SocketEventServerEnumerator.RECEIVE_CARD_FROM_ENEMY, card, attackerSocket);
                }
            })
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
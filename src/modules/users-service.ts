import { BehaviorSubject } from "rxjs";
import { Socket } from "socket.io";
import Container, { Service } from "typedi";
import { TetrisGridPiece } from "../entity/tetris-grid";
import { User } from "../entity/user";
import { SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { TimerService } from "./timer-service";

@Service()
export class UsersService{
    private users : Array<User> = [];
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
        const user = this.users.find((user)=>{
            return user.socketId == socket.id
        });
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
}
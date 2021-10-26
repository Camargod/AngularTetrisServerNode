import { Socket } from "socket.io";
import Container, { Service } from "typedi";
import { TetrisGridPiece } from "../entity/tetris-grid";
import { User } from "../entity/user";
import { SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";

@Service()
export class UsersService{
    private users : Array<User> = [];

    constructor(        
        private socketHandler : SocketEventHandlingMappingService
    ) {}

    addUser(userId : string,socket : Socket){
        let user = this.users.find(user => user.userId == userId);
        if(user){
            user.socketId = socket.id;
        }
        else{
            this.users.push(new User(userId,socket.id));
            //this.setUserGameGrid(new Array<TetrisGridPiece>(),socket);
            this.returnAllGrids(socket)
        }
    }

    setUserGameGrid(grid : Array<TetrisGridPiece>, socket : Socket){
        const user = this.users.find((user)=>{
            return user.socketId == socket.id
        });
        if(!user){
            console.warn("Unauthenticated player")
        } else{
            user!.playerGrid = grid;
            Container.get(SocketEventHandlingMappingService).emitMessage(`${SocketEventServerEnumerator.CHALLENGER_GRID_UPDATE}`,user);
        }
    }

    returnAllGrids(socket: Socket){
        Container.get(SocketEventHandlingMappingService).emitMessage(`${SocketEventServerEnumerator.ALL_CHALLENGER_GRID}`,this.users);

    }
    
    getPlayersNumber(){
        return this.users.length;
    }
}
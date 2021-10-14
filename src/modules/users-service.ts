import { Socket } from "socket.io";
import { Service } from "typedi";
import { TetrisGrid } from "../entity/tetris-grid";
import { User } from "../entity/user";

@Service()
export class UsersService{
    private users : Array<User> = [];

    addUser(userId : string,socket : Socket){
        let user = this.users.find(user => user.socketId == socket.id);
        if(user){
            user.socketId = socket.id;
        }
        else{
            this.users.push(new User(userId,socket.id));
        }
    }

    setUserGameGrid(grid : Array<TetrisGrid>, socket : Socket){
        const user = this.users.find((user)=>{
            return user.socketId == socket.id
        });
        if(!user){
            console.warn("Unauthenticated player")
        } else{
            user!.playerGrid = grid;
        }
    }
    
    getPlayersNumber(){
        return this.users.length;
    }
}
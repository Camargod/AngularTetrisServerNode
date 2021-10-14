import { TetrisGrid } from "./tetris-grid";

export class User {
    userId !: string;
    socketId !: string;
    playerGrid: Array<TetrisGrid> = new Array(28 * 12);

    constructor(userId : string, socketId : string){
        this.userId = userId;
        this.socketId = socketId;
    }
}
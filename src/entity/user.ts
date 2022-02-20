import { TetrisGridPiece } from "./tetris-grid";

export class User {
    userId !: string;
    socketId !: string;
    playerGrid: Array<TetrisGridPiece> = new Array(28 * 12);
    deafeated : boolean = false;
    
    constructor(userId : string, socketId : string){
        this.userId = userId;
        this.socketId = socketId;
    }
}
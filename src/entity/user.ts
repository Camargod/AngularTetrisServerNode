import { Socket } from "socket.io";
import { TetrisGridPiece } from "./tetris-grid";

export class User {
    userId !: string;
    socketId !: string;
    playerGrid: Array<TetrisGridPiece> = new Array(28 * 12);
    deafeated : boolean = false;
    badges : number = 0;
    kos : number = 0;
    accumulatedTrash : number = 0;
    attackers : Array<String> = new Array(0);
    focusing ?: String;
    playedRounds : number = 0;
    constructor(userId : string, socketId : string){
        this.userId = userId;
        this.socketId = socketId;
    }
}
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Server } from "socket.io";
import { Service } from "typedi";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { MatchService } from "./match-service";
import { TimerService } from "./timer-service";

@Service()
export class GameService {

    gameEnded : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private socketEvents : SocketEventHandlingMappingService,
        private timerService : TimerService,
        private matchService : MatchService
    ){}

    setSocketIo(socketIo : Server){
        this.socketEvents.setSocketIo(socketIo)
    }

    async gameStart(){
        console.log("----- SERVIDOR INICIADO -------")
        this.socketEvents.setSocketListening();
        console.log("----- ROTINA DE TIMER INICIADA -------");
        await lastValueFrom(this.timerService.start());
        console.log("----- ROTINA DE PARTIDA INICIADA -------");
        await lastValueFrom(this.matchService.start());
        this.gameEnded.next(true);
    }
}
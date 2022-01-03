import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Server } from "socket.io";
import { Service } from "typedi";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { TimerService } from "./timer-service";

@Service()
export class GameService {

    gameEnded : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private socketEvents : SocketEventHandlingMappingService,
        private timerService : TimerService
    ){}

    setSocketIo(socketIo : Server){
        this.socketEvents.setSocketIo(socketIo)
    }

    async gameStart(){
        this.socketEvents.setSocketListening();
        this.socketEvents.validateClientConnection();
        await lastValueFrom(this.timerService.start());
    }
}
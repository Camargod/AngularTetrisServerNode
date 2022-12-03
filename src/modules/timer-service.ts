import { BehaviorSubject, Subscriber } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import Container, { Service } from "typedi";
import { ServerConsts } from "../const/server-const";
import { SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { TetrominoGen } from "./tetromino-gen/tetromino-gen";
import { UsersService } from "./users-service";

@Service()
export class TimerService {
    timerInterval ?: NodeJS.Timer;
    timer = ServerConsts.LOBBY_TIMER;
    isEnabled = new BehaviorSubject(true);

    constructor(
        private userService : UsersService,
        private tetrominoGen : TetrominoGen
    ){}

    start() : Observable<boolean>{
        let bindedObs = this.startWithContext.bind(this);
        return new Observable(bindedObs);
    }

    private startWithContext(observer : Subscriber<any>){
        const timerEventEnum = SocketEventServerEnumerator;
        let this1 = this;
        let socketHandler = Container.get(SocketEventHandlingMappingService);
        this.timerInterval = setInterval(()=>{
            if(this1.userService.alivePlayers.value > 1) this1.timer--;
            socketHandler.emitMessage(`${timerEventEnum.TIME_UPDATE}`, this1.timer)
            socketHandler.emitMessage(`${timerEventEnum.IN_MATCH_PLAYERS}`, this1.userService.getPlayersNumber())
            if(this1.timer == 0){
                socketHandler.emitMessage(`${timerEventEnum.RECEIVE_PIECES_QUEUE}`, this1.tetrominoGen.shuffle());
                socketHandler.emitMessage(SocketEventServerEnumerator.ALIVE_PLAYERS,this.userService.getAlivePlayers().length);
                clearInterval(this1.timerInterval!);
                this1.isEnabled.next(false);
                observer.next();
                observer.complete();
                observer.unsubscribe();
            }
        },1000)
    }

}
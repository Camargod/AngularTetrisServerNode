import { Observable } from "rxjs/internal/Observable";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { Service } from "typedi";
import { ServerConsts } from "../const/server-const";
import { SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { UsersService } from "./users-service";

@Service()
export class TimerService {
    timerInterval ?: NodeJS.Timer;
    timer = ServerConsts.LOBBY_TIMER;
    isEnabled : AnonymousSubject<boolean> = new AnonymousSubject();

    constructor(
        private socketHandler : SocketEventHandlingMappingService,
        private userService : UsersService
    ){}

    start() : Observable<boolean>{
        return new Observable((observer)=> {
            const timerEventEnum = SocketEventServerEnumerator;
            this.timerInterval = setInterval(()=>{
                this.timer--;
                this.socketHandler.emitMessage(`${timerEventEnum.TIME_UPDATE}`, this.timer)
                this.socketHandler.emitMessage(`${timerEventEnum.IN_MATCH_PLAYERS}`, this.userService.getPlayersNumber())
                if(this.timer == 0){
                    clearInterval(this.timerInterval!);
                    this.isEnabled.next(false);
                    observer.next();
                    observer.complete();
                    observer.unsubscribe();
                }
            },1000)
        })
        
    }


}
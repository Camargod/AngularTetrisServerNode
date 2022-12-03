import { BehaviorSubject, Observable, Subscriber, Subscription } from "rxjs";
import { Service } from "typedi";
import { ServerConsts } from "../const/server-const";
import { SocketEventServerEnumerator } from "../enums/socket-event.enum";
import { SocketEventHandlingMappingService } from "../mapping/socket-handler-events";
import { UsersService } from "./users-service";

@Service()
export class MatchService {

    constructor(private userService : UsersService,private socketMessage :SocketEventHandlingMappingService){}
    
    isGameOver = new BehaviorSubject(false);
    matchSpeed = ServerConsts.INITIAL_GAME_SPEED;
    matchLoopTimeout ?: NodeJS.Timeout;

    _alivePlayersSubscription ?: Subscription;

    start() : Observable<boolean>{
        this.userService.alivePlayers.next(this.userService.getAlivePlayers().length);
        this._alivePlayersSubscription = this.userService.alivePlayers.subscribe((alivePlayers)=>{
            if(alivePlayers == 1){
                this.isGameOver.next(true);
            }
        });

        return new Observable((obs)=>{
            this.matchLoopTimeout = setTimeout(()=>{
                if(this.matchSpeed >= ServerConsts.MAX_GAME_SPEED) this.matchSpeed -= 10;
                this.socketMessage.emitMessage(SocketEventServerEnumerator.MATCH_SPEEDUP,this.matchSpeed);
            }, ServerConsts.SPEEDUP_TIME_MS)

            let overSub = this.isGameOver.subscribe((isGameOver)=>{
                if(isGameOver){
                    this.endMatch(obs);
                    overSub.unsubscribe();
                }
            });
            
        })
    }

    private endMatch(observable : Subscriber<boolean>){
        clearTimeout(this.matchLoopTimeout!);
        console.log("Game ended");
        observable.next(true);
        observable.complete();
        observable.unsubscribe();
    }
}
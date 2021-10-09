import { Service } from "typedi";

@Service()
export class GameService {



    instanceExists(){
        console.log("Aoba, sua injeção ta maneira")
    }
}
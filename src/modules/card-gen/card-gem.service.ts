import { Service } from "typedi";
import { GeneratorBase } from "../tetromino-gen/generator-base";

@Service()
export class CardGen implements GeneratorBase {
    numbers: number[] = [1,1,0,0,0,0,0,2,2,2,2,2,2,0,3,3,3,3,2,0];
    i : number = this.numbers.length;
    transfer = 0;
    randomIndex = 0;

    shuffle() : number[] {
        while(this.i){
            this.randomIndex = Math.floor(Math.random() * this.i--);
            this.transfer = this.numbers[this.i];
            this.numbers[this.i] = this.numbers[this.randomIndex];
            this.numbers[this.randomIndex] = this.transfer;
        }
        return [this.numbers[Math.floor(Math.random() * this.numbers.length)]];
    }
    
}
import { Service } from "typedi";
import { GeneratorBase } from "./generator-base";

@Service()
export class TetrominoGen implements GeneratorBase{

  constructor(){}

  numbers = [0,1,2,3,4,5,6];
  i = this.numbers.length;
  transfer = 0;
  randomIndex = 0;


  shuffle() : Array<number>{
    let pieces : Array<number> = [];
    for(let limit = 250; limit >= 0; limit--){
      while(this.i){
        this.randomIndex = Math.floor(Math.random() * this.i--);

        this.transfer = this.numbers[this.i];
        this.numbers[this.i] = this.numbers[this.randomIndex];
        this.numbers[this.randomIndex] = this.transfer;
      }
      this.i = this.numbers.length;
      pieces.push(...this.numbers);
    }
    return pieces;
  }

}

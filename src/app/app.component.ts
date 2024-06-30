import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import puzzle from "./puzzles.json"
// import * as confetti from 'canvas-confetti';
import { ElementRef, Renderer2 } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [trigger("colorState", [
    state(
      "lightblue",
      style({
        background: "lightblue",
      })
    ),
    state(
      "blue",
      style({
        background: "#c5cae9",
      })
    ),
    state(
      "highlight",
      style({
        background: "#5d92cf",
        color: "white"
      })
    ),
    state(
      "highlight-light",
      style({
        background: "#86a8cf",
        color: "white",
        // border: "solid 1px #000"
      })
    ),
    state(
      "red",
      style({
        background: "red",
        color: "black"
      })
    ),
    state(
      "lightblue-grey",
      style({
        background: "lightblue",
        color: "DimGray"
      })
    ),
    state(
      "blue-grey",
      style({
        background: "#c5cae9",
        color: "DimGray"
      })
    ),
    transition("* => *", animate("300ms steps(10)")),
  ]),
]
})
export class AppComponent implements OnInit {

  constructor(private renderer2: Renderer2,
    private elementRef: ElementRef) { 
    this.cols = 9;
    this.rows = 9;
    this.grid =[];
    this.currentPuzzle = puzzle[Math.floor(Math.random()*1000)];
    for(let i=0;i<10;i++)
      this.count[i] = 0;
    for(let i=0;i<this.rows;i++){
      this.grid[i] = [];
      this.solution[i] = [];
      this.colorState[i] = [];
      for(let j=0;j<this.cols;j++){
        this.grid[i][j]= +this.currentPuzzle.charAt(i*9+j);
        this.solution[i][j]= +this.currentPuzzle.charAt(i*9+j);
        if(this.grid[i][j]!=0){
          this.map.push(i+""+j);
          this.filledValues++;
        }
        this.count[+this.currentPuzzle.charAt(i*9+j)]++;
      }
    }
    this.solveSudoku(this.solution)
  }

  cols: number;
  rows: number;
  grid: number[][];
  colorState: string[][] =[];
  buttons: number[] =[];
  xSelected: number = -1;
  ySelected: number = -1;
  // breakpoint: number = 1;
  currentPuzzle: string;
  activeButton: boolean[] = [];
  count: number[] = [];
  map: Object[] = [];
  solution: number[][] = [];
  filledValues: number = 0;
  done: boolean = false;
  ngOnInit(): void {
    // this.breakpoint = (window.innerWidth <= 450) ? 3 : 1;
    this.defaultColor();
    for(let i=0;i<9;i++){
      this.buttons[i] = i+1;
    }
  }
  // onResize(event: any) {
  //   this.breakpoint = (event.target.innerWidth <= 450) ? 3 : 1;
  // }
  defaultColor(){
    for(let i=0;i<this.rows;i++){
      this.colorState[i]=[];
      for(let j=0;j<this.cols;j++){
        if((i<3 && j<3) || (i>5 && j>5) || (i>5 && j<3) || (i<3 && j>5) || (i>2 && i<6 && j>2 && j<6)){
          this.colorState[i][j]="blue";
        }
        else{
          this.colorState[i][j]="lightblue";
        }
      }
    }
    for(let p in this.map){
      let x = this.map[p] as number[];
      let i = x[0], j=x[1];
      if((i<3 && j<3) || (i>5 && j>5) || (i>5 && j<3) || (i<3 && j>5) || (i>2 && i<6 && j>2 && j<6))
        this.colorState[i][j] = "blue-grey"; 
      else
      this.colorState[i][j] = "lightblue-grey";
    }
  }
  selectCell(x: number,y: number){
    this.defaultColor();
    this.xSelected=x;
    this.ySelected=y;
    if(this.grid[x][y]==0){
      this.colorState[x][y]="highlight"
    }
    else{
      for(let i=0;i<this.rows;i++){
        for(let j=0;j<this.cols;j++){
          if(this.xSelected === i || this.ySelected === j)
            this.colorState[i][j]="highlight-light"
          if(this.grid[i][j] == this.grid[x][y])
            this.colorState[i][j] = "highlight"
        }
      }
    }
    this.validate();
  }
  
  fillValue(n: number){
    let tmp = this.xSelected+""+this.ySelected;
    if(this.xSelected>=0 && !this.map.includes(tmp)){
      this.count[this.grid[this.xSelected][this.ySelected]]--;
      if(this.grid[this.xSelected][this.ySelected]==0)
        this.filledValues++;
      this.grid[this.xSelected][this.ySelected] = n;
      this.count[n]++;
      if(this.count[n]==9)
        this.activeButton[n-1]=true;
      this.defaultColor();
      this.colorState[this.xSelected][this.ySelected]="#1a237e"
      this.selectCell(this.xSelected,this.ySelected)
    }
    if(this.filledValues==81 && this.result()){
      console.log("Win");
      this.done = true;
    }
  }

  eraseValue(){
    let tmp = this.xSelected+""+this.ySelected;
    if(this.xSelected>=0 && !this.map.includes(tmp)){
      this.colorState[this.xSelected][this.ySelected] = "lightblue";
      // console.log(this.count);
      this.count[this.grid[this.xSelected][this.ySelected]]--;
      this.activeButton[this.grid[this.xSelected][this.ySelected]-1] = false;
      this.grid[this.xSelected][this.ySelected] = 0;
      this.filledValues--;
      this.count[0]++;
      // console.log(this.count);
      this.done = false;
      this.defaultColor();
      // console.log(this.xSelected, this.ySelected)
      this.colorState[this.xSelected][this.ySelected]="highlight"
    }
  }

  validate(){
    debugger;
    let flag = false;
    for(let i=0;i<this.rows;i++){
      if(this.xSelected!=i && this.grid[i][this.ySelected]==this.grid[this.xSelected][this.ySelected] && this.grid[this.xSelected][this.ySelected]!=0){
        this.colorState[i][this.ySelected] = "red";
        flag = true;
      }
      if(flag)
        this.colorState[this.xSelected][this.ySelected] = "red";
    }
    for(let i=0;i<this.cols;i++){
      if(this.ySelected!=i && this.grid[this.xSelected][i]==this.grid[this.xSelected][this.ySelected] && this.grid[this.xSelected][this.ySelected]!=0){
        this.colorState[this.xSelected][i] = "red";
        flag = true;
      }
      if(flag)
        this.colorState[this.xSelected][this.ySelected] = "red";
    }
    let x = Math.floor(this.xSelected/3)*3;
    let y = Math.floor(this.ySelected/3)*3;  
    for(let i=x;i<x+3;i++){
        for(let j=y;j<y+3;j++){
          if(this.xSelected!=i && this.ySelected!=j && this.grid[i][j]==this.grid[this.xSelected][this.ySelected] && this.grid[this.xSelected][this.ySelected]!=0){
            this.colorState[i][j]="red";
            flag = true;
          }
        }
        
        if(flag)
          this.colorState[this.xSelected][this.ySelected] = "red";
    }
  }
  
  isSafe(board: number[][], row:number, col:number, num:number)
  {
      
      // Row has the unique (row-clash)
      for(let d = 0; d < board.length; d++)
      {
          
          // Check if the number we are trying to
          // place is already present in
          // that row, return false;
          if (board[row][d] == num)
          {
              return false;
          }
      }
  
      // Column has the unique numbers (column-clash)
      for(let r = 0; r < board.length; r++)
      {
            
          // Check if the number
          // we are trying to
          // place is already present in
          // that column, return false;
          if (board[r][col] == num)
          {
              return false;
          }
      }
  
      // Corresponding square has
      // unique number (box-clash)
      let sqrt = Math.floor(Math.sqrt(board.length));
      let boxRowStart = row - row % sqrt;
      let boxColStart = col - col % sqrt;
  
      for(let r = boxRowStart;
              r < boxRowStart + sqrt; r++)
      {
          for(let d = boxColStart;
                  d < boxColStart + sqrt; d++)
          {
              if (board[r][d] == num)
              {
                  return false;
              }
          }
      }
  
      // If there is no clash, it's safe
      return true;
  }

  solveSudoku(board:number[][])
  {
      let row = -1;
      let col = -1;
      let isEmpty = true;
      let solution = board;
      for(let i = 0; i < 9; i++)
      {
          for(let j = 0; j < 9; j++)
          {
              if (board[i][j] == 0)
              {
                  row = i;
                  col = j;
  
                  // We still have some remaining
                  // missing values in Sudoku
                  isEmpty = false;
                  break;
              }
          }
          if (!isEmpty)
          {
              break;
          }
      }
  
      // No empty space left
      if (isEmpty)
      {
          return true;
      }
  
      // Else for each-row backtrack
      for(let num = 1; num <= 9; num++)
      {
          if (this.isSafe(solution, row, col, num))
          {
              solution[row][col] = num;
              if (this.solveSudoku(board))
              {
                  
                  // print(board, n);
                  
                  return true;
              }
              else
              {
                  
                  // Replace it
                  solution[row][col] = 0;
              }
          }
      }
      return false;
  }
  
  result(){
    for(let i=0;i<9;i++)
      for(let j=0;j<9;j++){
        if(this.grid[i][j]!=this.solution[i][j]){
          return false;
        }
      }
    return true;
  }

  isConflicting(row: number, col: number): boolean {
    // Check row and column conflicts
    for (let i = 0; i < 9; i++) {
      if (i !== col && this.grid[row][i] === this.grid[row][col]) {
        return true;
      }
      if (i !== row && this.grid[i][col] === this.grid[row][col]) {
        return true;
      }
    }

    // Check 3x3 box conflict
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && this.grid[i][j] === this.grid[row][col]) {
          return true;
        }
      }
    }

    return false;
  }

  isGiven(row: number, col: number): boolean {
    return this.grid[row][col] !== 0;
  }

  isHighlighted(row: number, col: number): boolean {
    return this.xSelected === row || this.ySelected === col;
  }


 restart(): void {
   window.location.reload();
  }
}

// Minesweeper
// By: Matthijs van Mierlo
// 5/13/2022

let currScreen = null;
let homeScreen = null;
let gameScreen = null;

function setup() {
  createCanvas(600, 500);
  background(255);
  gameScreen = new GameScreen();
  homeScreen = new HomeScreen();
  currScreen = homeScreen;
}

class MyButton{
  constructor(t, x, y, w, h){
    this.text = t;
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
  }
  drawMe(){
    textSize(12);
    fill(100, 0, 0);
    stroke(255, 0, 0);
    rect(this.x, this.y, this.width, this.height);
    fill(255);
    stroke(255);
    text(this.text, this.x + 8, this.y + 17);
  }
  isClicked(x, y){
    return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
  }
}

function draw() {
  currScreen.drawMe();
}

function mousePressed() {
  currScreen.processMouse();
}

function checkBoard(){
    for(let r = 0; r < gameScreen.grid.board.length; r++){
      for(let c = 0; c < gameScreen.grid.board[0].length; c++){
        let temp = gameScreen.grid.board[r][c];
        if((temp.flagged && !temp.isBomb()) || (!temp.flagged && temp.isBomb())){
          alert("Missed a bomb! Game over.");
          setup();
          return;
        }
      }
    }
    alert("You win!");
    setup();
  }

function homeToGame(){
  currScreen = gameScreen;
}

class HomeScreen{
  constructor(){
    this.text = "Minesweeper";
    this.author = "By: Matthijs van Mierlo";
    this.start = new MyButton(" Play", 50, 200, 50, 25);
    this.how = new MyButton("How?", 150, 200, 50, 25);
  }
  drawMe(){
    background(100, 100, 100);
    fill(255);
    stroke(255);
    textSize(50);
    text(this.text, 50, 100);
    textSize(20);
    text(this.author, 50, 150);
    this.start.drawMe();
    this.how.drawMe();
  }
  processMouse(){
    if(this.start.isClicked(mouseX, mouseY)){
      homeToGame();
    }
  }
}

class GameScreen{
  constructor(){
    this.grid = null;
    this.check = null
    this.reset = null;
    this.grid = new Board();
    this.check = new MyButton("Check", 525, 350, 50, 25);
    this.reset = new MyButton("Reset", 525, 400, 50, 25);
  }
  drawMe(){
    background(255);
    fill(255, 0, 0);
    rect(0, 0, 50, 50);
    this.grid.show();
    stroke(0);
    fill(0);
    text("Bombs:", 525, 50);
    text(this.grid.numBombs, 525, 100);
    text("Remaining:", 525, 150);
    text(this.grid.numBombs - this.grid.bombsLocated, 525, 200);
    this.check.drawMe();
    this.reset.drawMe();
  }
  processMouse(){
    // Input for grid
    if(mouseButton == LEFT && !isKeyPressed){
    this.grid.processLeftClick();
    }else if(mouseButton == LEFT && keyCode == SHIFT){
      this.grid.processRightClick();
    }
    // Input for buttons
    if(this.check.isClicked(mouseX, mouseY)){
      checkBoard();
    }else if(this.reset.isClicked(mouseX, mouseY)){
      setup();
    }
  }
}

class Cell {
  constructor() {
    // 0 -> nothing
    // -1 -> bomb
    // 1, 2, 3 -> bomb nearby
    this.val = 0;
    this.flagged = false;
    this.revealed = false;
  }
  makeBomb() {
    this.val = -1;
  }
  isBomb() {
    return this.val == -1;
  }
  incrementNeighbor() {
    if (!this.isBomb()) {
      this.val += 1;
    }
  }
  flagCell() {
    this.flagged = true;
  }
  isFlagged() {
    return this.flagged == true;
  }
}

class Board {
  constructor() {
    this.board = [];
    this.numBombs = 10;
    this.bombsLocated = 0;
    // Generate cells for whole board...
    for (let r = 0; r < 10; r++) {
      let row = [];
      for (let c = 0; c < 10; c++) {
        row.push(new Cell());
      }
      this.board.push(row);
    }
    // Randomly place bombs
    for (let i = 0; i < this.numBombs; i++) {
      let rC = Math.floor(Math.random() * this.board[0].length);
      let rR = Math.floor(Math.random() * this.board.length);
      // Make sure space wasn't chosen as bomb already...
      let temp = this.board[rR][rC];
      while(temp.isBomb()){
        let rC = Math.floor(Math.random() * this.board[0].length);
        let rR = Math.floor(Math.random() * this.board.length);
        temp = this.board[rR][rC];
      }
      temp.makeBomb();
    }
    // Increment neighbors for rest of grid
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[0].length; col++) {
        // Find diagonals
        if (this.board[row][col].isBomb()) {
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              if (this.isValid(row + i, col + j)) {
                this.board[row + i][col + j].incrementNeighbor();
              }
            }
          }
        }
      }
    }
  }
  show() {
    let count = 0;
    let colors = [255, 50, 75, 100, 125, 150, 175, 200];
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[0].length; col++) {
        // Adjust width for side bar
        let x = Math.floor((col * (width - 100)) / this.board[0].length);
        let y = Math.floor((row * height) / this.board.length);
        let dim = (width - 100) / this.board.length;
        let temp = this.board[row][col];
        if(temp.revealed && !temp.flagged){
          let color = colors[temp.val + 1];
          stroke(color, 0, 0);
          fill(color, 0, 0);
          rect(x, y, dim, dim);
          stroke(255);
          fill(255);
          text(temp.val, x + 20, y + 30);
        }else if(temp.flagged){
          stroke(255);
          fill(255);
          rect(x, y, dim, dim);
          stroke(0);
          fill(0);
          text("*", x + 20, y + 30);
        }else{
          fill(150);
          stroke(255);
          rect(x, y, dim, dim);
          // stroke(0);
          // fill(0);
          // text(temp.val, x + 20, y + 30);
        }
      }
    }
  }
  revealSquares(startRow, startCol){
    console.log("RUN");
    let temp = this.board[startRow][startCol];
    // If the current one has not been revealed yet...
    if(!temp.revealed && temp.flagged == false){
      temp.revealed = true;
      for(let i = -1; i < 2; i++){
        for(let j = -1; j < 2; j++){
          if(this.isValid(startRow + i, startCol + j)){
            // If one of the neighbors is empty continue exploring
            temp = this.board[startRow + i][startCol + j];
            if(temp.val == 0 && temp.flagged == false){
              this.revealSquares(startRow + i, startCol + j);
            }else if(temp.flagged == false){
              temp.revealed = true;
            }
          }
        }
      }
    }
  }
  isValid(row, col){
    return row >= 0 && row < this.board.length && col >= 0 && col < this.board[0].length;
  }
  processLeftClick(x, y) {
    let dim = Math.floor((width - 100) / this.board.length);
    let c = Math.floor(mouseX / dim);
    let r = Math.floor(mouseY / dim);
    if(this.isValid(r, c)){
      if(this.board[r][c].isBomb() && this.board[r][c].flagged == false){
        alert("Game over!");
        setup();
      }else{
        // Reveal here according to Minesweeper rules, DFS
        if(this.board[r][c].val == 0 && this.board[r][c].flagged == false){
          this.revealSquares(r, c);
        }else if(this.board[r][c].flagged == false){
          this.board[r][c].revealed = true;
        }
      }
    }
  }
  processRightClick(x, y){
    let dim = Math.floor((width - 100) / this.board.length);
    let c = Math.floor(mouseX / dim);
    let r = Math.floor(mouseY / dim);
    if(this.isValid(r, c)){
      let temp = this.board[r][c];
      if(temp.flagged){
        temp.flagged = false;
        this.bombsLocated -= 1;
      }else if(this.numBombs - this.bombsLocated > 0){
        temp.flagged = true;
        this.bombsLocated += 1;
      }
    }
  }
}

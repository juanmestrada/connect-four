/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
const modal = document.getElementById('modal');
const dialogue = document.querySelector('.dialogue');

class Player {
  constructor(color){
    this.color = color;
  }
}

class Game {
  constructor(player1, player2, height=6, width=7){
    this.players = [player1, player2];
    this.currPlayer = player1;
    this.HEIGHT = height;
    this.WIDTH = width;
    this.board = [];
    this.gameOver = false;
  }
  makeBoard() {
    for (let y = 0; y < this.HEIGHT; y++) {
      this.board.push(Array.from({ length: this.WIDTH }));
    }
  }
  makeHtmlBoard() {
    const board = document.getElementById('board');

    // clear previous board
    board.innerHTML = '';

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick.bind(this));

    for (let x = 0; x < this.WIDTH; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    board.append(top);

    // make main part of board
    for (let y = 0; y < this.HEIGHT; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.WIDTH; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }
  findSpotForCol(x) {
    for (let y = this.HEIGHT - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
  
    return null;
  }
  placeInTable(y, x, counter) {
    if(counter > y) return;
  
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;
  
    const spot = document.getElementById(`${counter}-${x}`);

    const duration = 150;
    let delay = (150*counter);
    
    // create drop animation
    setTimeout(() => {
      spot.append(piece);
    }, delay);
  
    // remove non-active drop instances
    if(counter !== y){
      piece.classList.add("drop")
      setTimeout(() => {
        piece.classList.remove("drop")
        piece.style.opacity = 0;
        
        piece.remove();
        
      }, delay + duration);  
    }
    
    this.placeInTable(y, x, ++counter)
  }
  _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < this.HEIGHT &&
        x >= 0 &&
        x < this.WIDTH &&
        this.board[y][x] === this.currPlayer
    );
  }
  checkForWin() {

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
  
        // find winner (only checking each win-possibility as needed)
        if (this._win(horiz) || this._win(vert) || this._win(diagDR) || this._win(diagDL)) {
          return true;
        }
      }
    }
  }
  handleClick(evt) {
    // check if game is over
    if(this.gameOver) return;

    if(evt.target.nodeName !== "TD") return;
    
    // get x from ID of clicked cell
    const x = + evt.target.id;
  
    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }
  
    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x, 0);
    
    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.color} won!`);
    }
    
    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
      
    // switch players
    this.currPlayer = this.currPlayer === this.players[0] ? this.players[1] : this.players[0];

    // show active player
    document.documentElement.style.setProperty('--currplayer-color', this.currPlayer.color);
  }
  startGame(){
    // set new players
    let p1 = new Player(player1Color);
    let p2 = new Player(player2Color);
 
    this.players = [p1,p2];
    this.currPlayer = p1;

    // set initial hover color for player 1
    document.documentElement.style.setProperty('--currplayer-color', this.currPlayer.color);

    // reset gameover state
    this.gameOver = false;

    // create board
    this.makeBoard();
    this.makeHtmlBoard();
  }
  endGame(msg) {
    // update gameover state
    this.gameOver = true;

    // remove next player hover
    document.documentElement.style.setProperty('--currplayer-color', 'transparent');

    // display gameover message, restart menu
    this.createMenu('Game Over', msg, 'start', null, this.currPlayer.color);
    modal.classList.toggle('show');

    // reset board
    this.board.length = 0;

    // reset current player
    this.currPlayer = this.players[0];
  }
  createMenu(title, subtitle, id, defaultcolor, btntype){
    let _this = this;

    // create next menu with delay
    setTimeout(function(){
      dialogue.innerHTML = '';
  
      const titleText = document.createElement('h2');
      titleText.innerText = title;

      dialogue.append(titleText);
      
      if(subtitle){
        const subTitle = document.createElement('div');
        subTitle.innerText = subtitle;

        dialogue.append(subTitle);
      }
      
      if(defaultcolor){
        const colorInput = document.createElement('input');
      
        colorInput.setAttribute("type", 'color');
        colorInput.setAttribute("value", defaultcolor);

        dialogue.append(colorInput);
      }

      const nextBtn = document.createElement('button');
      nextBtn.setAttribute("id", id);
      nextBtn.classList.add(btntype);

      if(btntype === 'start'){
        nextBtn.innerText = "Start";
        const menuImg = document.createElement('img');
        menuImg.setAttribute('src', 'connect-four-pieces.png');

        dialogue.append(menuImg);
      } else if(btntype === 'next'){
        nextBtn.innerText = "Next";
      } else {
        const winner = document.createElement('span');
        winner.style.backgroundColor = btntype;
        winner.classList.add('winner-token');

        dialogue.append(winner);

        nextBtn.innerText = "Restart";
      }

      dialogue.append(nextBtn);
      nextBtn.addEventListener('click', _this.menuclickHandler.bind(_this));
      
      dialogue.classList.toggle("show");
    }, 400)
    
  }
  menuclickHandler(e){
    // handle next menu ui
    if(e.target.id === "start"){
      dialogue.classList.toggle("show");
      
      this.createMenu('Player 1', 'Select your color', 'player1', '#e66465', "next");
    } else if(e.target.id === "player1"){
      dialogue.classList.toggle("show");

      // set player 1 color
      player1Color = e.target.offsetParent.children[2].value;
      document.documentElement.style.setProperty('--p1-color', player1Color);

      this.createMenu('Player 2', 'Select your color', 'player2', '#f6b73c', 'next');
    } else if(e.target.id === "player2"){
      dialogue.classList.toggle("show");
      modal.classList.toggle("show");

      // set player 2 color
      player2Color = e.target.offsetParent.children[2].value;
      document.documentElement.style.setProperty('--p2-color', player2Color);

      // start game
      this.startGame();
    } else {
      // restart game
      modal.classList.toggle("show");
    }
  }
  setupGameMenu(){
    modal.classList.toggle("show");

    this.createMenu('Start Game?', null, 'start', null, "start");
  }
}

// default players
let player1Color = '#e66465';
let player2Color = '#f6b73c';

let game = new Game();

game.setupGameMenu();
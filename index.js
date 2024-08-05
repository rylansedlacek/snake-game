const KEY_CODE_RIGHT = 39;
const KEY_CODE_LEFT = 37;
const KEY_CODE_UP = 38;
const KEY_CODE_DOWN = 40;
const PLAYER_MAX_SPEED = 100;
const INSET = 1;
//const canvas = document.getElementById("pacmanBoard");
var canvas;
//const ctx = canvas.getContext("2d");
var ctx;
let tileSize = 25;


const GAME_STATE = { //thanks stephen #GameState for life
    lastTime: Date.now(),
    leftPressed: false,
    rightPressed: false,
    upPressed: false,
    downPressed: false,
    playerRadius: 9,
    score: 0,
    lives: 3,
    pelletsEaten: 0
}

const layout = [ 
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
      [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
      [2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
      [0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
      [2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
      [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
      [2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
      [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
      [0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

let randomDirection;
var interval;
var seconds = 4;
var board = document.querySelector("#board");
var gameOverDisplay = document.querySelector(".gameOver");

var bricks = []; //fill bricks array here
for (let i = 0; i<layout.length; i++) {
    bricks[i] = [];
    for (let j = 0; j<layout[i].length; j++) {
        bricks[i][j] = {x: 0, y:0, isEaten: false};
    }
}

window.onLoad = function () {
 // ctx = canvas.getContext("2d");
canvas = document.getElementById("pacmanBoard");  
ctx = canvas.getContext("2d");
canvas.width = 24 * 19;
canvas.height = 24 * 23;
}

// ghost move
function getDirection() {
    var dirs = { 
        //         0
        //      3     1
        //         2
        0: "up",
        1: "right",
        2: "down",
        3: "left"
    }
    var rando = Math.floor(Math.random() * 4);
    randomDir = dirs[rando];
    return randomDir;
}

//player here
const player = {
    x: canvas.width/2,
    y: canvas.height/2+25,
    vx: 2,
    vy: 2,
    direction: "right",
    prevPos:{},
    isDead: false,

 updatePosition: function(layout){
      this.prevPos = {x: this.x, y: this.y};   
      if (GAME_STATE.leftPressed){
      this.x -= this.vx;
      this.direction = "left";
    } 
    if (GAME_STATE.rightPressed){
      this.x += this.vx;
      this.direction = "right";
    }
    if (GAME_STATE.upPressed){
     this.y -= this.vy;
     this.direction = "up";
    }
    if (GAME_STATE.downPressed){
      this.y += this.vy;
      this.direction = "down";
    }
  },

  draw: function(ctx, tileSize){
    var angle1 = {
      start: 0,
      end: 0,
      drawDir: false
    };
    var angle2 = {
      start: 0,
      end: 0,
      drawDir: false
    };
    
  if (this.direction === "right"){
    angle1 = {start: 0.25, end: 1.25, drawDir: false};
    angle2 = {start: 0.75, end: 1.75, drawDir: false};
  }

  if (this.direction === "left"){
    angle1 = {start: 0.25, end: 1.25, drawDir: true};
    angle2 = {start: 0.75, end: 1.75, drawDir: true};
  }

  if (this.direction === "up"){
    angle1 = {start: 1.25, end: 0.25, drawDir: true};
    angle2 = {start: 0.75, end: 1.75, drawDir: true};
  }

  if (this.direction === "down"){
    angle1 = {start: 0.75, end: 1.75, drawDir: false};
    angle2 = {start: 1.25, end: 0.25, drawDir: false};
  }

    ctx.beginPath();
    ctx.arc(player.x, player.y, GAME_STATE.playerRadius, angle1.start * Math.PI, angle1.end * Math.PI, angle1.drawDir);
    ctx.fillStyle = "rgb(255, 255, 0)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x, player.y, GAME_STATE.playerRadius, angle2.start * Math.PI, angle2.end * Math.PI, angle2.drawDir);
    ctx.fill();
    
    }
}

//no clue that this existed
class Ghost {
    constructor(x,y,color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = 2;
        this.xy = 2;
        this.radius = 8;
        this.prevPos ={};
        this.isScared = false;
        this.isEatable = false; //pause
        this.direction = "right";
    }

    draw() {
        if (this.isScared === true) {
            ctx.beginPath();
            ctx.fillStyle = "blue";
            ctx.arc(this.x , this.y, this.radius, Math.PI, 2* Math.PI);
            ctx.lineTo(this.x + this.radius, this.y + this.radius);
            ctx.arc(this.x + this.radius / 2, this.y + this.radius, this.radius * 0.5, 0, Math.PI);
            ctx.arc(this.x + this.radius / 2 - this.radius , this.y + this.radius,this.radius * 0.5, 0, Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "blue";
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x , this.y, this.radius, Math.PI, 2* Math.PI);
            ctx.lineTo(this.x + this.radius, this.y + this.radius);
            ctx.arc(this.x + this.radius / 2, this.y + this.radius, this.radius * 0.5, 0, Math.PI);
            ctx.arc(this.x + this.radius / 2 - this.radius , this.y + this.radius,this.radius * 0.5, 0, Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
    } // end draw

    move() {
        this.prevPos = {x: this.x, y: this.y};
        if (this.direction === "up"){
            this.y -= this.vy;
        } else if (this.direction === "down"){
            this.y += this.vy;
        } else if (this.direction === "left"){
            this.x -= this.vx;
        } else if (this.direction === "right"){
            this.x += this.vx;
        }
    } //end move;

    stop() {
        this.vx = 0;
        this.vy = 0;
    }

    changeDirection() {
        if (this.direction === getDirection()){
            getDirection();
        } else {
            this.direction = randomDirection;
        }
    }// end change
} //end class 

var ghostA = new Ghost(canvas.width/2, canvas.height/2 - 76, "lightBlue");
var ghostB = new Ghost(canvas.width/2, canvas.height/2 - 76, "red");
var ghostC = new Ghost(canvas.width/2, canvas.height/2 - 76, "pink");
var ghostD = new Ghost(canvas.width/2, canvas.height/2 - 76, "yellow");

var ghosts = [ghostA, ghostB, ghostC, ghostD];

//I love pellets
const pellet = {
  draw:function(ctx, layout, pelletX, pelletY, tileSize){
    ctx.beginPath();
    ctx.arc(pelletX,pelletY,3, 0, 2 * Math.PI, false);
    ctx.fillStyle = "white";
    ctx.fill();
  },
  remove:function(ctx, layout, x, y, tileSize){
    ctx.fillStyle = "black";
    ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
  }
} // end pellet here

//I love power pellets, this is what the wiki called them not me
const powerPellet = {
  radius: 0,
  draw:function(ctx, layout, powerPelletX, powerPelletY, tileSize) {
    ctx.beginPath();
    ctx.arc(powerPelletX, powerPelletY, this.radius, 0, 2* Math.PI, false);
    ctx.fillStyle = "white";
    ctx.fill();
  },

  remove:function(ctx,layout,x,y,tileSize) {
    ctx.fillStyle = "black";
    ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
  }
}

function dilate() {
  var fps = 10;
  setTimeout(function() {
    requestAnimationFrame(dilate);

    if (++powerPellet.radius > 5) {
      while(powerPellet.radius > 0) {
        powerPellet.radius--;
      }
      powerPellet.radius++;
    }
  }, 1000/ fps);
} // this is a mess make it better

function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeRect(0,0,canvas.width,canvas.height);
}

function drawScore() {
  ctx.font = "15px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Score: " + GAME_STATE.score, 10, canvas.height);
}

function drawLives() {
  var postitions = [
    canvas.width/2 - tileSize,
    canvas.width/2,
    canvas.width/2 + tileSize
  ];
  var lives = {
    x:0, 
    y: canvas.height - GAME_STATE.playerRadius
  }

  for (let i = 0; i < GAME_STATE.lives; i++) {
    lives.x = positions[i];
    ctx.beginPath();
    ctx.arc(lives.x, lives.y, GAME_STATE.playerRadius, 0.25 * Math.PI, 1.25 * Math.PI, false);
    ctx.fillStyle = "rgb(255, 255, 0)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lives.x, lives.y, GAME_STATE.playerRadius, 0.75 * Math.PI, 1.75 * Math.PI, false);
    ctx.fill();
  }
}

function drawBoard(){
  for (let c = 0; c < layout.length; c++){
  for (let r = 0; r < layout[c].length; r++){
    if (layout[c][r] === 0){
      var brickX = r * tileSize;
       var brickY = c * tileSize;
       bricks[c][r].x = brickX;
       bricks[c][r].y = brickY;
       bricks[c][r].type = "wall";
       drawWall(ctx, layout, brickX, brickY);
     } else if (layout[c][r] === 1){
       var pelletX = r * tileSize + tileSize/2;
       var pelletY = c * tileSize + tileSize/2;
       bricks[c][r].x = pelletX;
       bricks[c][r].y = pelletY;
       bricks[c][r].type = "pellet";
       if (bricks[c][r].isEaten){
         pellet.remove(ctx, layout, pelletX, pelletY, tileSize);
       } else {
         pellet.draw(ctx,layout,pelletX,pelletY,tileSize);
       }
    } else if (layout[c][r] === 4){
    var powerPelletX = r * tileSize + tileSize/2;
    var powerPelletY = c * tileSize + tileSize/2;
    bricks[c][r].x = powerPelletX;
    bricks[c][r].y = powerPelletY;
    bricks[c][r].type = "powerPellet";
    if (bricks[c][r].isEaten){
      powerPellet.remove(ctx, layout, powerPelletX, powerPelletY, tileSize);
    } else {
      powerPellet.draw(ctx, layout, powerPelletX, powerPelletY, tileSize);
     
    }
  }
 }
}
}

function drawWall(ctx, layout, brickX, brickY){
      ctx.fillStyle="#0000ff";
      ctx.fillRect(brickX, brickY, tileSize , tileSize);
      ctx.strokeRect(brickX, brickY, tileSize, tileSize);
}

function drawGhosts() {
  for (let i = 0; i<ghosts.length; i++) {
    ghosts[i].draw();
  }
}

function moveGhost() {
  for (let i = 0; i<ghosts.length; i++) {
    ghosts[i].move();
  }
}

function collision(){
  for(var c=0; c<layout.length; c++) {
    for(var r=0; r<layout[c].length; r++) {
      var b = bricks[c][r];
      
      for (var i = 0; i < ghosts.length; i++){
        if(ghosts[i].x + ghosts[i].radius > b.x && 
          ghosts[i].x < b.x + tileSize + ghosts[i].radius && 
          ghosts[i].y + ghosts[i].radius > b.y - 5 && 
          ghosts[i].y < b.y+tileSize+ghosts[i].radius && b.type === "wall"){

        ghosts[i].x = ghosts[i].prevPos.x;
        ghosts[i].y = ghosts[i].prevPos.y;
        ghosts[i].changeDirection();

      }

      if (player.x + GAME_STATE.playerRadius > ghosts[i].x && 
        player.x < ghosts[i].x   + tileSize && 
        player.y + GAME_STATE.playerRadius > ghosts[i].y && 
        player.y < ghosts[i].y + tileSize && !player.isDead){

        if (!ghosts[i].isScared){
          player.isDead = true;
        
        ghosts[i].x = ghosts[i].prevPos.x;
        ghosts[i].y = ghosts[i].prevPos.y;
        player.x = player.prevPos.x;
        player.y = player.prevPos.y;
        GAME_STATE.lives -= 1;
        checkGameOver();
        } else if (ghosts[i].isEatable){
          ghosts[i].isEatable = false;
          ghosts[i].x = canvas.width / 2;
          ghosts[i].y = canvas.height / 2 - 76;
          ghosts[i].direction = "right";
          GAME_STATE.score += 200;
        }
        
      }
      }
      if(player.x + GAME_STATE.playerRadius > b.x && 
        player.x < b.x + tileSize + GAME_STATE.playerRadius && 
        player.y > b.y - GAME_STATE.playerRadius && player.y < b.y+tileSize+GAME_STATE.playerRadius ) {
        if (b.type === "wall"){
          if (GAME_STATE.leftPressed){
            player.x += player.vx;
          }
          if (GAME_STATE.rightPressed){
            player.x -= player.vx;
          }
          if (GAME_STATE.upPressed){
            player.y += player.vy;
          }
          if (GAME_STATE.downPressed){
            player.y -= player.vy;
          }
        }
      }
      
      if(player.x + GAME_STATE.playerRadius > b.x && 
        player.x < b.x + GAME_STATE.playerRadius && player.y > b.y - GAME_STATE.playerRadius && 
        player.y < b.y+GAME_STATE.playerRadius && !b.isEaten){
        if (b.type === "pellet" || b.type === "powerPellet"){
          b.isEaten = true;
          GAME_STATE.score += 10; 
          GAME_STATE.pelletsEaten += 1;
          checkGameWin();
          if (b.type === "powerPellet"){
            for (var i = 0; i < ghosts.length; i++){
              if (ghosts[i].isScared){
                interval = clearTimeout(interval);
                interval = setTimeout(unScareGhost, 10000);
              } else {
                ghosts[i].isScared = true;
                ghosts[i].isEatable = true;
                interval = setTimeout(unScareGhost, 10000);
              }
                
            }
            
          }
        }
      }
      
      if (player.x > canvas.width){
        player.x = 1;
      } else if (player.x < 1){
        player.x = canvas.width - 1;
      }

    }
  }
}

function unScareGhost() {
  for (let i = 0; i<ghosts.length; i++) {
    ghosts[i].isScared = false;
  }
}

function checkGameOver() {
  if (player.isDead) {
    player.isDead = false;
    player.x = canvas.width/2;
    player.y = canvas.width/2 +25;

    if (GAME_STATE.lives < 1) {
      gameOver();
    }
  }
}

function checkGameWin() {
  if (GAME_STATE.pelletsEaten === 182) {
    for (let i = 0; i < ghosts.length; i++) {
      ghosts[i].stop();
    }
  }
}

function gameOver() {
  player.isDead = false;
  board.style.display = "none";
  gameOverDisplay.style.display = "block";
}

function update(e) {
    player.updatePosition(layout);
    moveGhosts();
    clearCanvas();
    drawBoard();
    drawGhosts();
    drawScore();
    drawLives();
    player.draw(ctx, tileSize);
    collision();
    window.requestAnimationFrame(update);
}

function onKeyDown(e){
  if (e.keyCode === KEY_CODE_LEFT){
    GAME_STATE.leftPressed = true;
  } else if (e.keyCode === KEY_CODE_RIGHT){
    GAME_STATE.rightPressed = true;
  } else if (e.keyCode === KEY_CODE_UP){
    GAME_STATE.upPressed = true;
  } else if (e.keyCode === KEY_CODE_DOWN){
    GAME_STATE.downPressed = true;
  }
}

function onKeyUp(e){
  if (e.keyCode === KEY_CODE_LEFT){
    GAME_STATE.leftPressed = false;
  } else if (e.keyCode === KEY_CODE_RIGHT){
    GAME_STATE.rightPressed = false;
  } else if (e.keyCode === KEY_CODE_UP){
    GAME_STATE.upPressed = false;
  } else if (e.keyCode === KEY_CODE_DOWN){
    GAME_STATE.downPressed = false;
  }
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.requestAnimationFrame(update);
dilate();

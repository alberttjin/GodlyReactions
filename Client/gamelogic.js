var mainChar;
var healthBar;
var username;
var enemyName;
var enemyHealthBar;
var MAX_HP = 4;
var enemy;
var enemyAttack;
var firstJoined = false;
var prevMouseX2;
var prevMouseY2;
var prevMouseX;
var prevMouseY;
var mouseX;
var mouseY;
var attack;
var setAttack = false;
var setEnemyAttack = false;
var attackExists = false;
var moving = false;
var invincible = false;
var enemyInvincible = false;
var frames = 0;
var background = new Image();
background.src = "background.png";

//Set of functions/variables that manipulate the HTML Canvas and read input
function startGame() {
    gameState.start();

    //set player starting coordinates and screen size
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var xLeftCoor = screenWidth / 4;
    var xRightCoor = (screenWidth * 3) / 4;
    var yCoor = screenHeight / 2;

    //instantiate player and enemy on left side if first connected
    if (firstJoined) {
      mouseX = xLeftCoor;
      mouseY = yCoor;
      mainChar = new character(75, 75, "dragon.png", xLeftCoor, yCoor, MAX_HP, true);
      enemy = new character(75, 75, "dragon.png", xRightCoor, yCoor, MAX_HP, false);
      healthBar = new healthbar(50, 10, xLeftCoor + 10, yCoor + 70, MAX_HP);
      enemyHealthBar = new healthbar(50, 10, xRightCoor + 10, yCoor + 70, MAX_HP);
    } else {
      //otherwise instantiate player and enemy on right side
      mouseX = xRightCoor;
      mouseY = yCoor;
      enemy = new character(75, 75, "dragon.png", xLeftCoor, yCoor, MAX_HP, false);
      mainChar = new character(75, 75, "dragon.png", xRightCoor, yCoor, MAX_HP, true);
      healthBar = new healthbar(50, 10, xRightCoor + 10, yCoor + 70, MAX_HP);
      enemyHealthBar = new healthbar(50, 10, xLeftCoor + 10, yCoor + 70, MAX_HP);
    }

}

var gameState = {
    //create canvas and start function
    canvas : document.createElement("canvas"),
    start : function() {
        //set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        //get context and put canvas at least viewing priority
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        //this.interval = setInterval(updateGame, 20);
        window.requestAnimationFrame(updateGame);
        username = sessionStorage.getItem("username");
        socket.emit('username', {enemyUser: username});
        window.addEventListener('keydown', function (e) {
          if (!attackExists) {
            fire();
          }
        });
        window.addEventListener('keyup', function (e) {
          gameState.key = false;
        });
        window.addEventListener('mousemove', function (e) {
          gameState.currX = e.clientX;
          gameState.currY = e.clientY;
        });
        window.addEventListener('resize', resizeCanvas);
    }
}

function resizeCanvas() {
    //reisze canvas if player resizes screen
    gameState.canvas.width = window.innerWidth;
    gameState.canvas.height = window.innerHeight;
}

function clearCanvas() {
    gameState.context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
}

function setMousePos(event) {
    //set the position of the previous mouse click to calculate movement for char
    prevMouseX2 = prevMouseX;
    prevMouseY2 = prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = event.clientX;
    mouseY = event.clientY;
    //rotate char state that character is moving
    rotateChar();
    moving = true;
}


//Set of constructors that create the objects in the game
function character(width, height, image, x, y, hp, currUser) {
    this.currUser = currUser;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.hp = hp;
    this.charModel = new Image();
    this.charModel.src = image;
    this.update = function() {
      //update function checks for hp loss
      if (setEnemyAttack) {
        if (checkHP() && !invincible) {
          this.hp -= 1;
          healthBar.hp -= 1;
          socket.emit('damaged');
          invincible = true;
          socket.emit('invincible');
          if (this.hp <= 0) {
            socket.emit("lost");
            location.href = "youlose.html";
          }
        }
      }
      //draws character onto canvas along with rotation and username
      ctx = gameState.context;
      ctx.save();
      ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
      ctx.rotate(this.angle);
      ctx.drawImage(this.charModel, this.width / -2, this.height / -2, this.width, this.height);
      ctx.restore();
      ctx.font = "bold 12pt calibri";
      ctx.fillStyle = "white";
      if (this.currUser) {
        console.log("myuser");
        ctx.fillText(username, this.x + 10, this. y - 15);
      } else {
        ctx.fillText(enemyName, this.x + 10, this. y - 15);
      }
    }
}

function projectile(width, height, image, x, y, goalx, goaly) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.goalx = goalx;
    this.goaly = goaly;
    this.charModel = new Image();
    this.charModel.src = image;
    var xDis = Math.pow(this.goalx - this.x, 2);
    var yDis = Math.pow(this.goaly - this.y, 2);
    var hypotenuse = Math.sqrt(xDis + yDis);
    this.moveX = ((this.goalx - this.x) / hypotenuse) * 20;
    this.moveY = ((this.goaly - this.y) / hypotenuse) * 20;
    this.update = function() {
      //continually moves projectile until off screen
      this.x += this.moveX;
      this.y += this.moveY;
      ctx = gameState.context;
      ctx.drawImage(this.charModel, this.x, this.y, this.width, this.height);
    }
}

function healthbar(width, height, x, y, hp) {
    this.hp = hp;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.pictures = [];
    for (i = 1; i < 6; i++) {
      var currPic = new Image();
      currPic.src = i.toString() + ".png";
      this.pictures.push(currPic);
    }
    this.update = function() {
      ctx = gameState.context;
      ctx.drawImage(this.pictures[this.hp], this.x, this.y, this.width, this.height);
    }
}


//Set of functions that involve moving/rotating and instantiating objects
function moveChar() {
    if (moving) {
      /*calculates move distance toward mouse by taking fraction of x and y
      difference and dividing by the hypotenuse*/
      var hypotenuse = pythagorean(mouseX, mouseY, mainChar.x, mainChar.y);
      var xMove = ((mouseX - mainChar.x) / (hypotenuse * 1.5)) * 3;
      var yMove = ((mouseY - mainChar.y) / (hypotenuse * 1.5)) * 3;
      var xDist = mouseX - mainChar.x;
      var yDist = mouseY - mainChar.y;

      /* prevents going past the mouse click point by setting move variables to
      remainding distance if next move will exceed mouse click point*/
      if (mainChar.x < mouseX) {
        if (xDist < xMove) {
          xMove = xDist;
          yMove = yDist;
        }
      }
      if (mainChar.x > mouseX) {
        if (xDist > xMove) {
          xMove = xDist;
          yMove = yDist;
        }
      }

      if (mainChar.y < mouseY) {
        if (yDist < yMove) {
          xMove = xDist;
          yMove = yDist;
        }
      }
      if (mainChar.y > mouseY) {
        if (yDist > yMove) {
          xMove = xDist;
          yMove = yDist;
        }
      }

      mainChar.x += xMove;
      mainChar.y += yMove;
      moveHealthBar(xMove, yMove);
      updateServerChar(xMove, yMove);
    }
}

function moveEnemy(xMove, yMove) {
    enemy.x += xMove;
    enemy.y += yMove;
}

function moveHealthBar(xMove, yMove) {
    healthBar.x += xMove;
    healthBar.y += yMove;
    socket.emit('health', {healthX : xMove, healthY: yMove});
}

function moveEnemyHealthBar(xMove, yMove) {
    enemyHealthBar.x += xMove;
    enemyHealthBar.y += yMove;
}

function fire() {
    //say that attack exists and to launch attack at current position of mouse
    setAttack = true;
    attackExists = true;
    updateServerAttack(mainChar.x, mainChar.y, gameState.currX, gameState.currY);
    attack = new projectile(40, 40, "orb.png", mainChar.x, mainChar.y, gameState.currX, gameState.currY);
}

function rotateChar() {
    // rotation algorithm that finds rotate angle based on mouse click
    var slope = (mouseY - mainChar.y) / (mouseX - mainChar.x);
    var rotateAmount = (Math.PI / 2) + Math.atan(slope);
    if (mouseX < mainChar.x) {
      rotateAmount += Math.PI;
    }
    mainChar.angle = rotateAmount;
    socket.emit("angle", {rotation: rotateAmount});
}



//Set of boolean related functions that check for state of obejcts
function checkHP() {
    //check hitboxes to see if attack and character collided
    var enemyLowerX = enemyAttack.x + enemyAttack.width;
    var enemyLowerY = enemyAttack.y + enemyAttack.height;
    var lowerX = mainChar.x + mainChar.width;
    var lowerY = mainChar.y + mainChar.height;
    if (lowerX < enemyAttack.x) {
      return false;
    }
    if (mainChar.x > enemyLowerX) {
      return false;
    }
    if (lowerY < enemyAttack.y) {
      return false;
    }
    if (mainChar.y > enemyLowerY) {
      return false;
    }
    return true;
}

function checkStop() {
    moving = !(mainChar.x == mouseX && mainChar.y == mouseY);
}

function checkAttack() {
    //if attack is off screen, set its existence to false
    if (attack.x > gameState.canvas.width || attack.x < 0 ||
      attack.y > gameState.canvas.height || attack.y < 0) {
      attackExists = false;
    }
}

function checkEnemyAttack() {
    /*f enemy attack is off screen, set its existence to false and make main
    character vulnerable again */
    if (enemyAttack.x > gameState.canvas.width || enemyAttack.x < 0 ||
      enemyAttack.y > gameState.canvas.height || enemyAttack.y < 0) {
      attackExists = false;
      invincible = false;
      socket.emit("notinvincible");
    }
}

function showChar() {
    //calculates when to show character when invincible
    if (invincible) {
      return (frames % 10) < 5;
    } else {
      return true;
    }
}

function showEnemyChar() {
    //calculates when to show enemy character when invincible
    if (enemyInvincible) {
      return (frames % 10) < 5;
    } else {
      return true;
    }
}



//Set of update functions that update the state of the game as well as the server
function updateBackground() {
    var ctx = gameState.context;
    ctx.drawImage(background, 0, 0, gameState.canvas.width, gameState.canvas.height);
}

function updateServerChar(changeX, changeY) {
    //tell server change in character position
    var updateContent = {
      characterX: changeX,
      characterY: changeY,
    }
    socket.emit("updateChar", updateContent);
}

function updateServerAttack(x, y, x2, y2) {
    //tell server position and goal position of attack
    var updateContent = {
      currX: x,
      currY: y,
      goalX: x2,
      goalY: y2
    }
    socket.emit("updateAttack", updateContent);
}

function updateFrames() {
    //update frame count
    frames += 1;
}

function updateGame() {
    //updates game by calling all update functions and move functions
    checkStop();
    updateFrames();
    clearCanvas();
    updateBackground();
    moveChar();
    if (setAttack) {
      checkAttack();
      attack.update();
    }
    if (setEnemyAttack) {
      checkEnemyAttack();
      enemyAttack.update();
    }
    if (showChar()) {
      mainChar.update();
    }
    if (showEnemyChar()) {
      enemy.update();
    }
    healthBar.update();
    enemyHealthBar.update();
    window.requestAnimationFrame(updateGame);
}

//Utility functions for mathematical calculations
function pythagorean(x1, y1, x2, y2) {
    var xDis = Math.pow((x1 - x2), 2);
    var yDis = Math.pow((y1 - y2), 2);
    return Math.sqrt(xDis + yDis);
}

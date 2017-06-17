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

function startGame() {
    gameState.start();
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    if (firstJoined) {
      mouseX = screenWidth / 4;
      mouseY = screenHeight / 2;
      mainChar = new character(75, 75, "dragon.png", screenWidth / 4, screenHeight / 2, MAX_HP, true);
      enemy = new character(75, 75, "dragon.png", (screenWidth * 3) / 4, screenHeight / 2, MAX_HP, false);
      healthBar = new healthbar(50, 10, (screenWidth / 4) + 10, (screenHeight / 2) + 70, MAX_HP);
      enemyHealthBar = new healthbar(50, 10, ((screenWidth * 3) / 4) + 10, (screenHeight / 2) + 70, MAX_HP);
    } else {
      mouseX = (screenWidth * 3) / 4;
      mouseY = screenHeight / 2;
      enemy = new character(75, 75, "dragon.png", screenWidth / 4, screenHeight / 2, MAX_HP, false);
      mainChar = new character(75, 75, "dragon.png", (screenWidth * 3) / 4, screenHeight / 2, MAX_HP, true);
      healthBar = new healthbar(50, 10, ((screenWidth * 3) / 4) + 10, (screenHeight / 2) + 70, MAX_HP);
      enemyHealthBar = new healthbar(50, 10, (screenWidth / 4) + 10, (screenHeight / 2) + 70, MAX_HP);
    }

}

var gameState = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
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

function setMousePos(event) {
    prevMouseX2 = prevMouseX;
    prevMouseY2 = prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = event.clientX;
    mouseY = event.clientY;
    rotateChar();
    moving = true;
}

function rotateChar() {
    var slope = (mouseY - mainChar.y) / (mouseX - mainChar.x);
    var rotateAmount = (Math.PI / 2) + Math.atan(slope);
    if (mouseX < mainChar.x) {
      rotateAmount += Math.PI;
    }
    mainChar.angle = rotateAmount;
    socket.emit("angle", {rotation: rotateAmount});
}
function resizeCanvas() {
    gameState.canvas.width = window.innerWidth;
    gameState.canvas.height = window.innerHeight;
}

function pythagorean(x1, y1, x2, y2) {
    var xDis = Math.pow((x1 - x2), 2);
    var yDis = Math.pow((y1 - y2), 2);
    return Math.sqrt(xDis + yDis);
}
/*
function rotateCharSame() {
    var slope1 = (prevMouseY - prevMouseY2) / (prevMouseX - prevMouseX2);
    var slope2 = (mouseY - prevMouseY) / (mouseX - prevMouseX);
    var rotateAmount = Math.atan((slope2 - slope1) / (1 + (slope1 * slope2)));
    if (checkNegativeSame(slope1)) {
      rotateAmount *= -1;
    }
    mainChar.angle += rotateAmount;
    socket.emit("angle", {rotation: rotateAmount});
}

function checkNegativeSame(slope) {
    var b = y - (slope * x);
    var result = (slope * mouseX) + b;
    if (x > mainChar.x) {
      return result > mouseY;
    } else {
      return result < mouseY;
    }
}

function rotateChar() {
    var side1 = pythagorean(mouseX, mouseY, prevMouseX, prevMouseY);
    var side2 = pythagorean(mouseX, mouseY, mainChar.x, mainChar.y);
    var side3 = pythagorean(prevMouseX, prevMouseY, mainChar.x, mainChar.y);
    var numerator = Math.pow(side2, 2) + Math.pow(side3, 2) - Math.pow(side1, 2);
    var denominator = 2 * side2 * side3;
    var rotateAmount = Math.acos(numerator / denominator);
    if (checkNegative()) {
      rotateAmount *= -1;
    }
    mainChar.angle += rotateAmount;
    socket.emit("angle", {rotation: rotateAmount});
}

function checkNegative() {
    var slope = (prevMouseY - mainChar.y) / (prevMouseX - mainChar.x);
    var b = prevMouseY - (slope * prevMouseX);
    var result = (slope * mouseX) + b;
    if (prevMouseX > mainChar.x) {
      return result > mouseY;
    } else {
      return result < mouseY;
    }
}
*/

function moveChar() {
    if (moving) {
      var hypotenuse = pythagorean(mouseX, mouseY, mainChar.x, mainChar.y);
      var xMove = ((mouseX - mainChar.x) / (hypotenuse * 1.5)) * 3;
      var yMove = ((mouseY - mainChar.y) / (hypotenuse * 1.5)) * 3;
      var xDist = mouseX - mainChar.x;
      var yDist = mouseY - mainChar.y;
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

function moveHealthBar(xMove, yMove) {
    healthBar.x += xMove;
    healthBar.y += yMove;
    socket.emit('health', {healthX : xMove, healthY: yMove});
}

function moveEnemyHealthBar(xMove, yMove) {
    enemyHealthBar.x += xMove;
    enemyHealthBar.y += yMove;
}

function moveEnemy(xMove, yMove) {
    enemy.x += xMove;
    enemy.y += yMove;
}

function updateBackground() {
    var ctx = gameState.context;
    ctx.drawImage(background, 0, 0, gameState.canvas.width, gameState.canvas.height);
}

function clearCanvas() {
    gameState.context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
}

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

function checkHP() {
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

function fire() {
    setAttack = true;
    attackExists = true;
    updateServerAttack(mainChar.x, mainChar.y, gameState.currX, gameState.currY);
    attack = new projectile(40, 40, "orb.png", mainChar.x, mainChar.y, gameState.currX, gameState.currY);
}

function checkStop() {
    moving = !(mainChar.x == mouseX && mainChar.y == mouseY);
}

function checkAttack() {
    if (attack.x > gameState.canvas.width || attack.x < 0 || attack.y > gameState.canvas.height || attack.y < 0) {
      attackExists = false;
    }
}

function checkEnemyAttack() {
    if (enemyAttack.x > gameState.canvas.width || enemyAttack.x < 0 ||  enemyAttack.y > gameState.canvas.height || enemyAttack.y < 0) {
      attackExists = false;
      invincible = false;
      socket.emit("notinvincible");
    }
}

function updateServerChar(changeX, changeY) {
    var updateContent = {
      characterX: changeX,
      characterY: changeY,
    }
    socket.emit("updateChar", updateContent);
}

function updateServerAttack(x, y, x2, y2) {
    var updateContent = {
      currX: x,
      currY: y,
      goalX: x2,
      goalY: y2
    }
    socket.emit("updateAttack", updateContent);
}

function updateFrames() {
    frames += 1;
}

function showChar() {
    if (invincible) {
      return (frames % 10) < 5;
    } else {
      return true;
    }
}

function showEnemyChar() {
    if (enemyInvincible) {
      return (frames % 10) < 5;
    } else {
      return true;
    }
}

function updateGame() {
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

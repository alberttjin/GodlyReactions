var socket = io();

socket.on("updateAngle", function(data) {
    enemy.angle = data.rotation;
});


socket.on("updateEnemyChar", function(data) {
    moveEnemy(data.characterX, data.characterY);
});

socket.on("healthUpdate", function(data) {
    moveEnemyHealthBar(data.healthX, data.healthY);
});

socket.on("lowerHealth", function(data) {
    enemyHealthBar.hp -= 1;
});

socket.on("updateEnemyAttack", function(data) {
    setEnemyAttack = true;
    enemyAttack = new projectile(40, 40, "orb.png", data.currX, data.currY, data.goalX, data.goalY);
});

socket.on("firstJoined", function(data){
    firstJoined = true;
});

socket.on("enemyInvincible", function(data){
    console.log("asdf");
    enemyInvincible = true;
});

socket.on("enemyNotInvincible", function(data){
  console.log("assdfdf");
    enemyInvincible = false;
});

socket.on("enemyUserName", function(data){
    enemyName = data.enemyUser;
});

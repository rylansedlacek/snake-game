var canvas, ctx, head, food, gameLoop, lastX,lastY;
//
var body = [];
var direction = 1;
var score = 0;

window.onload = function () {
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");
    db = firebase.firestore();
    
    head = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
    }
    //
       food = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
       }
    //
    setupInputs();
    gameLoop = setInterval(step, 1000/8);

    document.getElementById("restart-button").addEventListener("click", restartGame)
    fetchLeaderboard();
}

function step() {
    if (body.length === 0) {
        lastX = head.x;
        lastY = head.y;
    } else {
        lastX = body[body.length - 1].x;
        lastY = body[body.length - 1].y;
    }

    for (let i = body.length - 1; i > 0; i--) {
        body[i].x = body[i - 1].x;
        body[i].y = body[i - 1].y;
    }

    if (body.length !== 0) {
        body[0].x = head.x;
        body[0].y = head.y;
    }

    //handle key input here
    if (direction === 0) {
        head.y--;
    } else if (direction === 1) {
        head.x++;
    } else if (direction === 2) {
        head.y++;
    } else if (direction === 3) {
        head.x--;
    }

    if (head.x === 20) {
        head.x = 0;
    } else if (head.x === -1) {
        head.x = 19;
    }

    if (head.y === 20) {
        head.y = 0; 
    } else if (head.y === -1) {
       head.y = 19;
    }

    //grow body here

    if (head.x === food.x && head.y === food.y) {
        food.x = Math.floor(Math.random() * 20);
        food.y = Math.floor(Math.random() * 20);

        let newBody = {
            x: lastX,
            y: lastY
        };
        body.push(newBody);
        score ++;
    }

    for (let i=0; i<body.length; ++i) {
        if (body[i].x === head.x && body[i].y === head.y) {
            clearTimeout(gameLoop);
            submitScore(score);
        }
    }


    draw(); //call static func here bud
}

function draw() {

    //draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,500,500);

    //draw head
    ctx.fillStyle = "green";
    ctx.fillRect(head.x * 25, head.y * 25, 25,25);

    //draw body here, too slow improve for performance issue
    for (let i=0; i<body.length; i++) {
        ctx.fillStyle = "green";
        ctx.fillRect(body[i].x * 25, body[i].y * 25, 25,25)
    }

    // draw fruit here same logic as head.
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 25, food.y * 25, 25,25);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
}



//this is trash change it to use keypress instead.
function setupInputs() {
    document.addEventListener("keydown", function(event) {

      

        if (event.key === "w" || event.key === "ArrowUp") {

            if (!(body.length > 1 && direction === 2)) {
                direction = 0;
            }

        } else if (event.key === "d" || event.key === "ArrowRight") {
          
            if (!(body.length > 1 && direction === 3)) {
                direction = 1;
            }

        } else if (event.key === "s" || event.key === "ArrowDown") {

              if (!(body.length > 1 && direction === 0)) {
                direction = 2;
              }

        } else if (event.key === "a" || event.key === "ArrowLeft") {

              if (!(body.length > 1 && direction === 1)) {
                direction = 3;
              }

        }
    });

}

function restartGame() {
  
        head = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
        
        food = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
    
        body = [];
        direction = 1;
        score = 0;

        clearInterval(gameLoop);
        gameLoop = setInterval(step, 1000 / 8);
}
    
function submitScore(score) {
    var playerName = prompt("Enter your name:");
    db.collection("leaderboard").add({
        name: playerName,
        score: score
    })
    .then(() => {
        fetchLeaderboard();
    })
    .catch((error) => {
        console.error("Error adding score: ", error);
    });
}


function fetchLeaderboard() {
    db.collection("leaderboard").orderBy("score", "desc").limit(10).get()
    .then((querySnapshot) => {
        var leaderboard = document.getElementById("leaderboard");
        leaderboard.innerHTML = "";
        querySnapshot.forEach((doc) => {
            var li = document.createElement("li");
            var br = document.createElement("br");
            li.textContent = doc.data().name + ": " + doc.data().score;
            leaderboard.appendChild(li);
            leaderboard.appendChild(br);
        });
    })
    .catch((error) => {
        console.error("Error getting leaderboard: ", error);
    });
}


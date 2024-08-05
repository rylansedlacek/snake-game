var canvas, ctx, head, food, gameLoop, lastX, lastY;
var body = [];
var direction = 1;
var score = 0;
var topScores = [];

window.onload = function () {
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");
    db = firebase.firestore(); //init dc here
    
    head = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
    };
    food = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
    };
    
    setupInputs();
    gameLoop = setInterval(step, 1000 / 8);

    document.getElementById("restart-button").addEventListener("click", restartGame);
    fetchLeaderboard(); //everytime for page load
    
 showArrowPad(); //just show it always
    


}

function showArrowPad() {
    document.getElementById('arrow-pad').style.display = 'flex';

    document.getElementById('up-btn').addEventListener('click', () => changeDirection(0));
    document.getElementById('right-btn').addEventListener('click', () => changeDirection(1));
    document.getElementById('down-btn').addEventListener('click', () => changeDirection(2));
    document.getElementById('left-btn').addEventListener('click', () => changeDirection(3));
}

function changeDirection(newDirection) {
    if (newDirection === 0 && direction !== 2) {
        direction = 0;
    } else if (newDirection === 1 && direction !== 3) {
        direction = 1;
    } else if (newDirection === 2 && direction !== 0) {
        direction = 2;
    } else if (newDirection === 3 && direction !== 1) {
        direction = 3;
    }
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

    //edit dir based on cardinal directions
    if (direction === 0) {
        head.y--;
    } else if (direction === 1) {
        head.x++;
    } else if (direction === 2) {
        head.y++;
    } else if (direction === 3) {
        head.x--;
    }

    //add borders here for head spawn
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

    //for growing the body
    if (head.x === food.x && head.y === food.y) {
        food.x = Math.floor(Math.random() * 20);
        food.y = Math.floor(Math.random() * 20);

        let newBody = {
            x: lastX,
            y: lastY
        };
        body.push(newBody);
        score++;
    }

    /**
     *  End of Game function
     *  Check and submit score if its above top 3
     */

    for (let i = 0; i < body.length; i++) {
        if (body[i].x === head.x && body[i].y === head.y) {
            clearTimeout(gameLoop);
            checkAndSubmitScore(score);
        }
    }

    draw(); //draw everytime in our game loop
}

function draw() {
    ctx.fillStyle = "black"; // background
    ctx.fillRect(0, 0, 500, 500);

    ctx.fillStyle = "green"; //head
    ctx.fillRect(head.x * 25, head.y * 25, 25, 25);

    for (let i = 0; i < body.length; i++) { //body
        ctx.fillStyle = "green";
        ctx.fillRect(body[i].x * 25, body[i].y * 25, 25, 25);
    }

    ctx.fillStyle = "red"; //food
    ctx.fillRect(food.x * 25, food.y * 25, 25, 25);

    ctx.fillStyle = "white"; //score text
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
}


/** 
 * Key handler here
 * 
*/

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

//Respawn everything and clear out gameloop
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


// check to make sure it's above top 3
function checkAndSubmitScore(score) {
    fetchTopScores().then(topScores => {
        if (topScores.length < 3 || score > topScores[2].score) {
            submitScore(score);
        }
    });
}

function submitScore(score) {
    var playerName = prompt("enter name:");
    db.collection("leaderboard").add({
        name: playerName,
        score: score
    })
    .then(() => {
        fetchLeaderboard();
    })
    .catch((error) => {
        console.error("didnt add score: ", error);
    });
}

function fetchTopScores() {
    return db.collection("leaderboard").orderBy("score", "desc").limit(3).get()
    .then((querySnapshot) => {
        var scores = [];
        querySnapshot.forEach((doc) => {
            scores.push(doc.data()); //push
        });
        return scores;
    })
    .catch((error) => {
        console.error("couldnt get top scores: ", error);
    });
}

function fetchLeaderboard() {                              //limit to top 3 to prevent scrolling bug 
    db.collection("leaderboard").orderBy("score", "desc").limit(3).get() 
    .then((querySnapshot) => {
        var leaderboard = document.getElementById("leaderboard");
        leaderboard.innerHTML = "";
        querySnapshot.forEach((doc) => {
            var li = document.createElement("li");
            li.textContent = doc.data().name + ": " + doc.data().score;
            leaderboard.appendChild(li);
        });
    })
    .catch((error) => {
        console.error("couldnt get the board: ", error);
    });
}

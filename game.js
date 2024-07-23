const canvas = document.createElement('pre');
document.body.appendChild(canvas);

const WIDTH = 160;
const HEIGHT = 10;
const OBSTACLE_DIFF = 15;
const INITIALGAMESPEED = 100;
let landscape = [];
let player = { x: 10, y: HEIGHT - 5, jumping: false, jumpHeight: 0 };
let score = 0;
let inputname = '';
let gameRunning = false;
let gameSpeed = INITIALGAMESPEED;
let lastObstaclePosition = 0;
let obstaclesPassed = 0;
let start = '';
let stop = '';
let savewith ='DQIdHBZMRkMTHwwACR8MDgAERwkQWSg/Jj8gQxYXHwk6EggYBFgZBBU=';
let getC = "DQIdHBZMRkMTHwwACR8MDgAERwkQWSg/Jj8gQwITHTwKBQAYDBkHQhUeGQ==";

const PLAYER_ART = [
    "  O  ",
    " /|\\ ",
    " / \\ ",
    "/   \\",
    "▀▀▀▀▀"
];

function generateLandscape() {
    for (let i = 0; i < 40; i++) {
        landscape[i] = ["_", " "];
    }
    for (let i = 40; i < WIDTH; i++) {
        landscape[i] = [];
        for (let j = 0; j < 2; j++) {  // Nur 2 Zeilen für die Landschaft
            if (j === 0) {
                if (lastObstaclePosition < OBSTACLE_DIFF) {
                    landscape[i][j] = "_";
                } else {
                    landscape[i][j] = Math.random() < 1 / 12 ? "^" : "_";
                }
            } else {
                if (landscape[i][0] === "^") {
                    landscape[i][j] = "|" 
                    lastObstaclePosition = 0;
                } else {
                    landscape[i][j] = " ";
                    lastObstaclePosition++;
                }
            }
        }
    }
}

function updateLandscape() {
    landscape.shift();
    let newColumn;

    if (lastObstaclePosition < OBSTACLE_DIFF) {
        newColumn = ["_", " "];
        lastObstaclePosition++;
    } else if (Math.random() < 1 / 12) {
        newColumn = ["^", "|"];
        lastObstaclePosition = 0;
    } else {
        newColumn = ["_", " "];
        lastObstaclePosition++;
    }

    landscape.push(newColumn);
}

function drawScene() {
    let scene = [];
    for (let y = 0; y < HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < WIDTH; x++) {
            if (x >= player.x && x < player.x + 5 && y >= player.y && y < player.y + 5) {
                row.push(PLAYER_ART[y - player.y][x - player.x]);
            } else if (y >= HEIGHT - 2) {
                row.push(landscape[x][y - (HEIGHT - 2)]);
            } else {
                row.push(' ');
            }
        }
        scene.push(row.join(''));
    }
    let statusMessage = gameRunning ? `Punkte: ${score}` : "Drücke 's' um das Spiel zu starten (Tippen bei Mobile)";
    canvas.textContent = scene.join('\n') + '\n' + statusMessage;
}

function getPlayerName() {
    let playerName = prompt("(Einmalig) Namen eingeben zum Highscore speichern", "");

    if (playerName === null) {
        // Benutzer hat auf "Abbrechen" geklickt
        console.log("Highscore-Speicherung abgebrochen");
        return '';
    } else if (playerName.trim() === "") {
        // Benutzer hat keinen Namen bzw. Leerzeichen eingegeben
        alert("Bitte gib deinen Spielernamen ein.");
        return getPlayerName(); // Rekursiver Aufruf, um erneut nach dem Namen zu fragen
    } else {
        // Gültiger Name wurde eingegeben. Leerzeichen entfernen und auf 20 Zeichen kürzen
        console.log("Highscore wird für " + playerName + " gespeichert");
        return playerName.trim().slice(0, 20);
    }
}

function getCurrentTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Monate sind 0-indiziert
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function gameLoop() {
    if (!gameRunning) return;

    updateLandscape();
    if (player.jumping) {
        player.jumpHeight++;
        if (player.jumpHeight > 3) {
            player.jumping = false;
        }
    } else if (player.jumpHeight > 0) {
        player.jumpHeight--;
    }

    player.y = HEIGHT - 5 - player.jumpHeight;

    // Überprüfe, ob ein Hindernis übersprungen wurde
    if (landscape[player.x][0] === "^" && player.jumpHeight > 0) {
        score += 5;  // 5 Extrapunkte für übersprungenes Hindernis
        obstaclesPassed++;
    }

    if ((landscape[player.x + 2][0] === "^" || landscape[player.x + 3][0] === "^" || landscape[player.x + 4][0] === "^")  && player.jumpHeight === 0) {
        gameRunning = false;
        stop = getCurrentTimestamp();
        let zusatztext = '';
        if (score > 500) {
            if (inputname != '') {
                zusatztext="Highscore für " + inputname + " wurde gespeichert!";
            }
        }
        alert(`Spiel vorbei! Punkte: ${score}\nHindernisse übersprungen: ${obstaclesPassed}\n${zusatztext}`);
        if (score > 500) {
            if (inputname === '') {
                inputname = getPlayerName();
            }
            if (inputname != '') {
                // Speichern des Highscores 
                saveGameData(inputname, start, stop, score, obstaclesPassed);
            } else {
                console.log("Highscore-Speicherung wurde abgebrochen");
            }
        }
        resetGame();
        return;
    }

    score++;

    // Erhöhe die Geschwindigkeit
    if (gameSpeed > 25) {
        gameSpeed = INITIALGAMESPEED - (5 * Math.floor(score / 100));
    }

    drawScene();
    setTimeout(gameLoop, gameSpeed);
}

function resetGame() {
    player = { x: 10, y: HEIGHT - 5, jumping: false, jumpHeight: 0 };
    score = 0;
    gameSpeed = 100;
    lastObstaclePosition = 0;
    obstaclesPassed = 0;
    generateLandscape();
    drawScene();
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        start= getCurrentTimestamp();
        gameLoop();
    }
}

async function calculatePosition(name, start, end, points, obstacles) {
    const data = {
        name: name,
        start: start,
        end: end,
        points: points,
        obstacles: obstacles
    };

    try {
        const response = await fetch(decrypt(getC, 'evil'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result.position;
    } catch (error) {
        console.error('Error calculating position:', error);
        throw error;
    }
}

// Beispielaufruf:
// saveGameData('Max Mustermann', '2024-07-04 10:00:00', '2024-07-04 10:15:00', 100, 5);
async function saveGameData(name, start, end, points, obstacles) {
    try {
    const position = await calculatePosition(name, start, end, points, obstacles);

    const data = {
        name: name,
        start: start,
        end: end,
        points: points,
        obstacles: obstacles,
        position: position
    };
    if (position === undefined) {
        throw new Error("Position could not be calculated");
    }
    const response = await fetch(decrypt(savewith, 'evil'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`Server responded with error`);
    }
    const result = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Überprüfen, ob das Gerät Touch-Events unterstützt
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    if (isTouchDevice()) {
        console.log("Touch-Events werden unterstützt.");
        document.addEventListener("touchstart", function(event) {
            event.preventDefault();
            if (!gameRunning) {
                startGame();
            } else {
                if (gameRunning && !player.jumping && player.jumpHeight === 0) {
                    player.jumping = true;
                }
            }
        });
    } else {
        console.log("Touch-Events werden nicht unterstützt.");
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 's' && !gameRunning) {
        startGame();
    } else if ((e.key === 'ArrowUp' || e.code === 'Space') && gameRunning && !player.jumping && player.jumpHeight === 0) {
        player.jumping = true;
    }
});

function encrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
}

function decrypt(encryptedText, key) {
    let text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

generateLandscape();
drawScene();
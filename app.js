//To Do:  
// - Lock delay — the grace period that finishes TODO #2, so you can actually use the gaps the collision fix opened.
// - Reset on restart— wiping the board after game - over.
// - The old wishlist: speed ramping with level, smarter scoring, hard - drop, ghost piece, a hold slot, sound, mobile buttons.
// - fix collision issue that doesn't allow blocks to slide into open spaces underneath



document.addEventListener('DOMContentLoaded', () => {

//GAME-BOARD
    const container = document.querySelector('.grid');
    for (let i = 0; i < 450; i++) {
        container.innerHTML += '<div>' + '</div>';
    };
    for(let i = 0; i <15; i++) {
        container.innerHTML += '<div class="taken">' + '</div>';
    }


//MINI-GRID GENERATORs
    const miniGrid = document.querySelector('.mini-grid');
    for (let i = 0; i < 30; i++) {
        miniGrid.innerHTML += '<div>' + '</div>';
    }



//GLOBAL VARIABLES
    let squares = Array.from(document.querySelectorAll('.grid div'));
    let score = 0;
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const width = 15;
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 5;
    let displayIndex = 1;
    let timerId;
    let firstBlock = true;
    let isGameOver = false;
    



//DISPLAY BLOCK ARRAYS
    const nextBlockArr = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2],
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [0, 1, displayWidth, displayWidth + 1],
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
    ];



//TETRIS BLOCK ARRAYS
    const lBlock = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zBlock = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tBlock = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oBlock = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iBlock = [
        [1, width + 1, width * 2 +1, width * 3 +1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 +1, width * 3 +1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theBlocks = [lBlock, zBlock, tBlock, oBlock, iBlock];
    const theColors = ['orange','red','purple','green','cyan'];
    let currentPosition = 6;
    let currentRotation = 0;

    //Randomly select a block and its first rotation
    let randomBlock = Math.floor(Math.random() * theBlocks.length);
    let nextRandom = 0;
    let current = theBlocks[randomBlock][currentRotation];
    

//DRAW/ERASE FUNCTIONS
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].style.backgroundColor = theColors[randomBlock];
        })
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].style.backgroundColor = '';
        })
    }

    function drawDisplay(){
        nextBlockArr[nextRandom].forEach(index => {
            displaySquares[displayIndex + (index+displayWidth)].style.backgroundColor = theColors[nextRandom];
        })
    }

    function undrawDisplay() {
        displaySquares.forEach(square => {
            square.style.backgroundColor = '';
        })
    }
  
    

//KEYCODE ASSIGNMENTS
    function control(e) {
        if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
        }
        if(e.key === "ArrowLeft") {
            moveLeft();
        } else if (e.key === "ArrowUp") {
            rotate();
        } else if (e.key === "ArrowRight") {
            moveRight();
        } else if (e.key === "ArrowDown") {
            moveDown();
        }
    }
    
    function nextBlock() {
        undrawDisplay();
        drawDisplay();
    }

    function freeze() {
        if (!isValidMove(currentPosition + width)) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            randomBlock = nextRandom;
            nextRandom = Math.floor(Math.random() * theBlocks.length);
            current = theBlocks[randomBlock][currentRotation];
            currentPosition = 6;
            draw();
            nextBlock();
            addScore();
        }
    }

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'GAMEOVER!';
            clearInterval(timerId);
            timerId = null;
            isGameOver = true;
        }
    }

    function reset() {
        squares.forEach((square, index) => {
            if (index < 450) {
                square.classList.remove('taken')
                square.style.backgroundColor = '';
            }
        });
        score = 0;
        scoreDisplay.innerHTML = score;
        randomBlock = Math.floor(Math.random() * theBlocks.length);
        currentRotation = 0;
        current = theBlocks[randomBlock][currentRotation];
        currentPosition = 6;
        nextRandom = Math.floor(Math.random() * theBlocks.length);
        nextBlock();
    }

    function isValidMove(position)  {
        return current.every(offset => {
            const cell = position + offset;
            return cell < squares.length && !squares[cell].classList.contains('taken');
        });
    }

//MOVEMENT PLUS EDGE DETECTION
    function moveDown() {
        if (timerId === null) {
            currentPosition += 0;
        } else {
            undraw();
            currentPosition += width;
            draw();
            freeze();
            gameOver();
        }
    }

    function moveLeft() {
        undraw();
        const atLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!atLeftEdge && isValidMove(currentPosition - 1)) {
            currentPosition  -= 1;
        }
        draw();
    }
    
    function moveRight() {
        undraw();
        const atRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!atRightEdge && isValidMove(currentPosition + 1)) {
            currentPosition += 1;
        }
        draw();
    }


    //BLOCK ROTATION
    function rotate() {
            undraw();
            const previousRotation = currentRotation
            currentRotation++;
            if (currentRotation === current.length) {
                currentRotation = 0;
            }
            current = theBlocks[randomBlock][currentRotation];

            const columns = current.map(offset => (currentPosition + offset) % width);
            const wrapped = Math.max(...columns) - Math.min(...columns) > 3;

            if (wrapped || !isValidMove(currentPosition)) {
                currentRotation = previousRotation;
                current =  theBlocks[randomBlock][currentRotation];
            }
            draw();
    }




//START/PAUSE FUNCTIONALITY
    function startToggle() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            if (isGameOver) {
                reset();
                isGameOver = false;
            }
            draw();
            timerId = setInterval(moveDown, 500);
            if (firstBlock) {
                nextRandom = Math.floor(Math.random() * theBlocks.length);
                nextBlock();
                firstBlock = false;
            }
        }
    }


//EVENT LISTENERS
    document.addEventListener('keydown', control);
    startBtn.addEventListener("click", startToggle);

    function addScore() {
        for (let i = 0; i < 449; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9, i + 10, i + 11, i + 12, i + 13, i + 14];
        
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score += 1;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].style.backgroundColor = '';
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(square => container.appendChild(square));
            }
        }
    }


});
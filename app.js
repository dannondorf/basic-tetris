//To Do:  
// - add colors and styles to blocks
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

    let currentPosition = 6;
    let currentRotation = 0;

    //Randomly select a block and its first rotation
    let randomBlock = Math.floor(Math.random() * theBlocks.length);
    let nextRandom = 0;
    let current = theBlocks[randomBlock][currentRotation];
    

//DRAW/ERASE FUNCTIONS
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('block');
        })
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('block');
        })
    }

    function drawDisplay(){
        nextBlockArr[nextRandom].forEach(index => {
            displaySquares[displayIndex + (index+displayWidth)].classList.add('block');
        })
    }

    function undrawDisplay() {
        displaySquares.forEach(square => {
            square.classList.remove('block');
        })
    }
  
    

//KEYCODE ASSIGNMENTS
    function control(e) {
        if(e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        }
    }
    
    function nextBlock() {
        undrawDisplay();
        drawDisplay();
    }

    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
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


//MOVEMENT PLUS EDGE DETECTION
    function moveDown() {
        if (timerId === null) {
            currentPosition += 0;
        } else {
            undraw();
            currentPosition += width;
            draw();
            freeze();
        }
    }

    function moveLeft() {
        undraw();
        const atLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (timerId === null || current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        if(!atLeftEdge) {
            currentPosition -= 1;
        }
        draw();
    }
    
    function moveRight() {
        undraw();
        const atRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (timerId === null || current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        if (!atRightEdge) {
            currentPosition += 1;
        }
        draw();
    }

    //FIXED ROTATIONS AT THE EDGE
    function isAtRight() {
        return current.some(index => (currentPosition + index + 1) % width === 0);
    }

    function isAtLeft() {
        return current.some(index => (currentPosition + index) % width === 0);
    }

    function checkEdgeRotation(p) {
        p = p || currentPosition;
        if ((p+1) % width < 4) {
            if (isAtRight()) {
                currentPosition += 1;
                checkEdgeRotation(p);
            }
        }
        else if (p % width > 5) {
            if (isAtLeft()) {
                currentPosition -= 1;
                checkEdgeRotation(p);
            }
        }
    }

    //BLOCK ROTATION
    function rotate() {
            undraw();
            currentRotation++;
            if (currentRotation === current.length) {
                currentRotation = 0;
            }
            current = theBlocks[randomBlock][currentRotation];
            checkEdgeRotation();
            draw();
    }




//START/PAUSE FUNCTIONALITY
    function startToggle() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
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
    document.addEventListener('keyup', control);
    startBtn.addEventListener("click", startToggle);

    function addScore() {
        for (let i = 0; i < 449; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9, i + 10, i + 11, i + 12, i + 13, i + 14];
        
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score += 1;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken', 'block')
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(square => container.appendChild(square));
            }
        }
    }


});
import Grid from "./Grid.js"
import Tile from "./Tile.js"

document.querySelector(".aaa").addEventListener('touchstart', handleTouchStart, false);
document.querySelector(".aaa").addEventListener('touchmove', handleTouchMove, false);

document.querySelector(".aaa").addEventListener('mousedown', handleMouseStart, false);
document.querySelector(".aaa").addEventListener('mouseup', handleMouseMove, false);

let xDown = null;
let yDown = null;

let xDownM = null;
let yDownM = null;

let timeS = 0;
let timeM = 0;

let score = 0

let tabs = []
let item = {}

const gameBoard = document.querySelector(".game-board")
const timeEl = document.querySelector(".timer")

let time = setInterval(decreaseTime, 1000)

let grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)

let statisticList = document.querySelector(".statistic__list")
let columTime = document.querySelector(".statistic__colum-time")
let columPosition = document.querySelector(".statistic__colum-position")
let columScore = document.querySelector(".statistic__colum-score")


document.querySelector(".ststistic__button").addEventListener("click", () => {
    if (statisticList.classList.contains("hide")) {
        statisticList.classList.remove("hide")
        statisticList.classList.add("show")
    }
})
document.querySelector(".satistic__close").addEventListener("click", () => {
    if (statisticList.classList.contains("show")) {
        statisticList.classList.remove("show")
        statisticList.classList.add("hide")
    }
})

console.log(document.querySelector(".statistic__colum-time").children.length)

setupInput()

function setupInput() {
    window.addEventListener("keydown", handleInput, { once: true })
}

async function handleInput(e) {
    switch (e.key) {
        case "ArrowUp":
            if (!canMoveUp()) {
                setupInput()
                return
            }
            await moveUp()
            break
        case "ArrowDown":
            if (!canMoveDown()) {
                setupInput()
                return
            }
            await moveDown()
            break
        case "ArrowLeft":
            if (!canMoveLeft()) {
                setupInput()
                return
            }
            await moveLeft()
            break
        case "ArrowRight":
            if (!canMoveRight()) {
                setupInput()
                return
            }
            await moveRight()
            break
        default:
            // await setupInput()
            break
    }

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(() => {
            alert("lose")
            lose()
        })
    }

    setupInput()
    newTile.waitForTransition(true).then(() => {
        checkWin()
        setsScore()
    })

}


function handleMouseStart(e) {
    xDownM = e.clientX
    yDownM = e.clientY
}

async function handleMouseMove(e,) {

    let x = e.clientX
    let y = e.clientY

    let xDiff = xDownM - x;
    let yDiff = yDownM - y;

    if (xDiff !== 0 && yDiff !== 0) {
        if (Math.abs(xDiff) > Math.abs(yDiff)) {

            if (xDiff > 0) {
                if (!canMoveLeft()) {
                    return
                }
                await moveLeft()
            } else {
                if (!canMoveRight()) {
                    return
                }
                await moveRight()
            }
        } else {
            if (yDiff > 0) {
                if (!canMoveUp()) {
                    return
                }
                await moveUp()
            } else {
                if (!canMoveDown()) {
                    return
                }
                await moveDown()
            }
        }

        xDownM = null;
        yDownM = null;

        grid.cells.forEach(cell => cell.mergeTiles())

        const newTile = new Tile(gameBoard)
        grid.randomEmptyCell().tile = newTile

        if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
            newTile.waitForTransition(true).then(() => {
                alert("lose")
                lose()
            })
        }

        newTile.waitForTransition(true).then(() => {
            checkWin()
            setsScore()
        })

    }




}

function getTouches(e) {
    return e.touches
}

function handleTouchStart(e) {
    const firstTouch = getTouches(e)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

async function handleTouchMove(e) {
    e.preventDefault()
    if (!xDown || !yDown) {
        return
    }

    let xUp = e.touches[0].clientX;
    let yUp = e.touches[0].clientY;


    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (yDiff !== 0 && xDiff !== 0) {
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                if (!canMoveLeft()) {
                    return
                }
                await moveLeft()
                e.preventDefault()
            } else {
                if (!canMoveRight()) {
                    return
                }
                await moveRight()
                e.preventDefault()
            }
        } else {
            if (yDiff > 0) {
                if (!canMoveUp()) {
                    return
                }
                await moveUp()
                e.preventDefault()
            } else {
                if (!canMoveDown()) {
                    return
                }
                await moveDown()
                e.preventDefault()
            }
        }

        xDown = null;
        yDown = null;

        grid.cells.forEach(cell => cell.mergeTiles())

        const newTile = new Tile(gameBoard)
        grid.randomEmptyCell().tile = newTile

        if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
            newTile.waitForTransition(true).then(() => {
                alert("lose")
                lose()
            })
        }

        newTile.waitForTransition(true).then(() => {
            checkWin()
            setsScore()

        })
        e.preventDefault()
    }

};

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(group => {
            const promises = []
            for (let i = 1; i < group.length; i++) {
                const cell = group[i]
                if (cell.tile == null) continue
                let lastValidCell
                for (let j = i - 1; j >= 0; j--) {
                    const moveToCell = group[j]
                    if (!moveToCell.canAccept(cell.tile)) break
                    lastValidCell = moveToCell
                }
                if (lastValidCell != null) {
                    promises.push(cell.tile.waitForTransition())
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile
                        score += cell.tile.value * 2
                    } else {
                        lastValidCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        }))
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(grid.cellsByRow)
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}

function decreaseTime() {
    let current = ++timeS

    if (current < 10) {
        current = `0${current}`
    }
    if (current === 60) {
        timeS = 0
        current = 0
        ++timeM
    }
    if (current === 0) {
        current = `00`
    }
    setTime(current)
}

function setTime(value) {
    timeEl.innerHTML = `${timeM}:${value}`
}

function lose() {
    clearInterval(time)
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }
    gameBoard.innerHTML = `<div class="aaa"></div>`
    document.querySelector(".aaa").addEventListener('touchstart', handleTouchStart, false);
    document.querySelector(".aaa").addEventListener('touchmove', handleTouchMove, false);

    document.querySelector(".aaa").addEventListener('mousedown', handleMouseStart, false);
    document.querySelector(".aaa").addEventListener('mouseup', handleMouseMove, false);
    grid = new Grid(gameBoard)
    grid.randomEmptyCell().tile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = new Tile(gameBoard)
    timeS = 0
    timeM = 0
    score = 0
    time = setInterval(decreaseTime, 1000)
}

function checkWin() {
    let count = 0;
    for (let i = 0; i < grid.cells.length; i++) {
        if (grid.cells[i].tile) {
            count += grid.cells[i].tile.value
            if (grid.cells[i].tile.value === 2048) {
                alert("win")
                columScore.innerHTML += `<div class="ststistic__score">${score}</div>`
                columTime.innerHTML += `<div class="ststistic__score">${timeM}:${timeS}</div>`
                columPosition.innerHTML += `<div class="ststistic__score">${columPosition.children.length + 1}.</div>`
                lose()
            }

        }
    }
}

function setsScore(){
    document.querySelector(".score").innerHTML = score
}


// console.log(grid.cells[0].tile.value)
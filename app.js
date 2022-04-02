import Grid from "./Grid.js"
import Tile from "./Tile.js"

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

document.addEventListener('mousedown', handleMouseStart, false);
document.addEventListener('mouseup', handleMouseMove, false);

let xDown = null;
let yDown = null;

const gameBoard = document.querySelector(".game-board")

const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)

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
            await setupInput()
            break
    }

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight) {
        newTile.waitForTransition(true).then(() => {
            alert("lose")
        })
    }

    setupInput()
}

function getTouches(e) {
    return e.touches
}

function handleTouchStart(e) {
    const firstTouch = getTouches(e)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;

    
}

function handleMouseStart(e) {
    let xDow = e.clientX
    let yDown = e.clientY

    // console.log(xDow, yDown)
}

async function handleMouseMove(e) {

    console.log("dddd")
    let x = e.clientX
    let y = e.clientY
    
    let xDiff = xDown - x;
    let yDiff = yDown - y;

    console.log(xDiff, yDiff)
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            if (!canMoveLeft()) {
                setupInput()
                return
            }
            await moveLeft()
        } else {
            if (!canMoveRight()) {
                setupInput()
                return
            }
            await moveRight()
        }
    } else {
        if (yDiff > 0) {
            if (!canMoveUp()) {
                setupInput()
                return
            }
            await moveUp()
        } else {
            if (!canMoveDown()) {
                setupInput()
                return
            }
            await moveDown()
        }
    }

    xDown = null;
    yDown = null;

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight) {
        newTile.waitForTransition(true).then(() => {
            alert("lose")
        })
    }

    setupInput()

}


async function handleTouchMove(e) {
    if (!xDown || !yDown) {
        return
    }

    let xUp = e.touches[0].clientX;
    let yUp = e.touches[0].clientY;


    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    console.log(xDiff, yDiff)

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            if (!canMoveLeft()) {
                setupInput()
                return
            }
            await moveLeft()
        } else {
            if (!canMoveRight()) {
                setupInput()
                return
            }
            await moveRight()
        }
    } else {
        if (yDiff > 0) {
            if (!canMoveUp()) {
                setupInput()
                return
            }
            await moveUp()
        } else {
            if (!canMoveDown()) {
                setupInput()
                return
            }
            await moveDown()
        }
    }

    xDown = null;
    yDown = null;

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight) {
        newTile.waitForTransition(true).then(() => {
            alert("lose")
        })
    }

    setupInput()
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


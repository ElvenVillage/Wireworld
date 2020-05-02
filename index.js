const cnv = document.querySelector("#cnv");
const ctx = cnv.getContext("2d");

const wh = 50;

const states = {
    wire: 1,
    head: 2,
    tail: 3,
    static: 4
};

const colors = (cell) => {
    switch (cell) {
        case 1:
            return "green";
        case 2:
            return "yellow";
        case 3:
            return "blue";
        case 4:
            return "black";
    }
};

let world = [];

let isStarted = false;
let selectedCell = states.wire;

let wasLMBPressed = false;

class Cell {
    constructor(x, y, state, neighbours) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.newState = state;
        this.neighbours = neighbours;
    }
}

const tick = (cell) => {
    switch (cell.state) {
        case states.tail: {
            cell.newState = states.wire;
            break;
        }
        case states.head: {
            cell.newState = states.tail;
            break;
        }
        case states.wire: {
            let count = 0;
            cell.neighbours.forEach((item) => {
                if (world[item].state === states.head) count++;
            })
            if ((count === 1) || (count === 2)) cell.newState = states.head
        }
    }
};

const worldTick = () => {
    world.forEach(cell => tick(cell));
    world.forEach(cell => {
        cell.state = cell.newState;
    })
};

const drawGrid = (x, y) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, x, y);

    ctx.strokeStyle = "white";

    for (let i = 0; i < x / wh; i++) {
        for (let j = 0; j < y / wh; j++) {
            ctx.strokeRect(i * wh, j * wh, wh, wh);
        }
    }
    ctx.stroke();
};

const drawWorld = (world) => {
    world.forEach(cell => {
        ctx.fillStyle = colors(cell.state);
        ctx.fillRect(cell.x * wh, cell.y * wh, wh, wh);
    })
};

const redraw = () => {
    drawGrid(1000, 1000);
    drawWorld(world);
    requestAnimationFrame(redraw);
};

const updateNeighbours = () => {
    for (let i = 0; i < world.length; i++) {
        world[i].neighbours = [];
        for (let j = 0; j < world.length; j++) {
            if (i === j) continue;
            if ((Math.abs(world[i].x - world[j].x) <= 1) && (Math.abs(world[i].y - world[j].y) <= 1)) {
                world[i].neighbours.push(j);
            }
        }
    }
};


let timer = null;

const start = () => {
    if (isStarted) return;
    isStarted = !isStarted;
    timer = setInterval(worldTick, 100);
};
const stop = () => {
    if (!isStarted) return;
    isStarted = !isStarted;
    clearTimeout(timer);
};

//Обработчик кнопки
document.querySelector("#submit").onclick = (e) => {
    const prevValue = e.target.value;

    switch (prevValue) {
        case "Start": {
            start();
            e.target.value = "Stop";
            break;
        }
        case "Stop": {
            stop();
            e.target.value = "Start";
            break;
        }
    }
};


//Обработчик нажатий на Canvas
cnv.onmousemove = (e) => {
    let rect;
    if (wasLMBPressed) {

        rect = cnv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const i = Math.trunc(x / wh);
        const j = Math.trunc(y / wh);
        if (selectedCell != states.static) {
            const cell = new Cell(i, j, selectedCell, []);
            let wasStated = false;
            for (let k = 0; k < world.length; k++) {
                if ((world[k].x === cell.x) && (world[k].y === cell.y)) {
                    world[k] = cell;
                    wasStated = true;
                    //updateNeighbours();
                    break;
                }
            }
            if (!wasStated) {
                world.push(cell);
                //updateNeighbours();
            }
            redraw();
        } else {
            for (let k = 0; k < world.length; k++) {
                if ((world[k].x === i) && (world[k].y === j)) {
                    world.splice(k, 1);
                    //updateNeighbours();
                    redraw();
                }
            }
        }
    }
};
cnv.onmousedown = (e) => {
    wasLMBPressed = true;
    stop();
    cnv.onmousemove(e)
}
cnv.onmouseup = () => {
    wasLMBPressed = false;
    updateNeighbours();
}


const drawInv = () => {
    const ctxn = document.querySelector("#inv").getContext("2d");
    ctxn.fillStyle = colors(states.wire);
    ctxn.fillRect(0, 0, 100, 100);
    ctxn.fillStyle = colors(states.tail);
    ctxn.fillRect(100, 0, 100, 100);
    ctxn.fillStyle = colors(states.head);
    ctxn.fillRect(200, 0, 100, 100);
    ctxn.fillStyle = colors(states.static);
    ctxn.fillRect(300, 0, 100, 100);
    ctxn.stroke();

    document.querySelector("#inv").onclick = (e) => {
        const x = e.clientX;
        if (x < 100) {
            selectedCell = states.wire;
            document.body.style.cursor = "url(green.png), auto";
            return;
        }
        if (x < 200) {
            selectedCell = states.tail;
            document.body.style.cursor = "url(blue.png), auto";
            return;
        }
        if (x < 300) {
            selectedCell = states.head;
            document.body.style.cursor = "url(yellow.png), auto";
            return;
        }
        selectedCell = states.static;
    }
};


const loadSave = () => {
    const save = document.getElementById("name").value;
    world = JSON.parse(save);
    updateNeighbours();
};

const saveWorld = () => {
    const newWorld = world.slice();
    for (let i = 0; i < newWorld.length; i++) {
        delete newWorld[i].neighbours;
        //delete newWorld[i].newState;
    }
    document.getElementById("name").value = JSON.stringify(world)
};

document.getElementById("select").onchange = () => {
    document.getElementById("name").value = document.getElementById("select").options[document.getElementById("select").selectedIndex].value;
    loadSave();
};

document.getElementById("saveButton").onclick = saveWorld;
document.getElementById("loadButton").onclick = loadSave;
requestAnimationFrame(redraw);
drawInv();
const cnv = document.querySelector("#cnv");
const ctx = cnv.getContext("2d");

const wh = 50;

const states = {
    wire: 1,
    head: 2,
    tail: 3
};

const colors = (cell) => {
    switch (cell) {
        case 1:
            return "green";
        case 2:
            return "yellow";
        case 3:
            return "blue";
    }
}

const world = [];

let isStarted = false;
let selectedCell = states.wire;

class Cell {
    constructor(x, y, state, neighbours) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.newState = state;
        this.neighbours = neighbours;
    }

    tick() {
        switch (this.state) {
            case states.tail: {
                this.newState = states.wire;
                break;
            }
            case states.head: {
                this.neighbours
                    .filter(item => item.state == states.wire)
                    .forEach(item => item.newState = states.head);
                this.newState = states.tail;
                break;
            }
        }
    }
}

const worldTick = () => {
    world.forEach(cell => cell.tick());
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

const redraw = (x, y) => {
    return () => {
        drawGrid(x, y);
        drawWorld(world);
        requestAnimationFrame(redraw(1000, 1000));
    }
};

const updateNeighbours = () => {
    for (let i = 0; i < world.length; i++) {
        world[i].neighbours = [];
        for (let j = 0; j < world.length; j++) {

            if ((Math.abs(world[i].x - world[j].x) <= 1) && (Math.abs(world[i].y - world[j].y) <= 1)) {
                world[i].neighbours.push(world[j]);
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
            stop()
            e.target.value = "Start";
            break;
        }
    }
};



//Обработчик нажатий на Canvas
cnv.onclick = (e) => {

    rect = cnv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const i = Math.trunc(x / wh);
    const j = Math.trunc(y / wh);
    const cell = new Cell(i, j, selectedCell, []);
    world.push(cell);
    updateNeighbours();

    redraw(1000, 1000)();
};

const drawInv = () => {
    const ctxn = document.querySelector("#inv").getContext("2d");
    ctxn.fillStyle = colors(states.wire);
    ctxn.fillRect(0, 0, 100, 100);
    ctxn.fillStyle = colors(states.tail);
    ctxn.fillRect(100, 0, 100, 100);
    ctxn.fillStyle = colors(states.head);
    ctxn.fillRect(200, 0, 100, 100);
    ctxn.stroke();

    document.querySelector("#inv").onclick = (e) => {
        const x = e.clientX;
        if (x < 100) {
            selectedCell = states.wire;
            return;
        }
        if (x < 200) {
            selectedCell = states.tail;
            return;
        }
        if (x < 300) {
            selectedCell = states.head;
            return;
        }
    }
}

requestAnimationFrame(redraw(1000, 1000));
drawInv();
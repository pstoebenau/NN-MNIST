const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const resetButton = document.getElementById("resetButton");
const testButton = document.getElementById("testButton");
const retrainButton = document.getElementById("retrainButton");
const lossText = document.getElementById("lossText");
const predictionTable = document.getElementById("predictionTable");
resetButton.addEventListener("click", resetBoard);
testButton.addEventListener("click", testDrawing);
retrainButton.addEventListener("click", train);
window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousedown", startClick);
canvas.addEventListener("mousemove", moveClick);
canvas.addEventListener("mouseup", stopClick);

let mouse = { x: 0, y: 0 };
let drawBoard = new DrawBoard();

const BATCH_SIZE = 64;
const TRAIN_BATCHES = 300;

async function main() {
  await loadData();
}

async function train() {
  for (let i = 0; i < TRAIN_BATCHES; i++) {
    const batch = tf.tidy(() => {
      const batch = data.nextTrainBatch(BATCH_SIZE);
      batch.xs = batch.xs.reshape([BATCH_SIZE, 28, 28, 1]);
      return batch;
    });

    const result = await model.fit(batch.xs, batch.labels, {
      batchSize: BATCH_SIZE,
      epochs: 1
    });

    lossText.innerHTML =
      "Model loss: " + Math.floor(result.history.loss[0] * 100000) / 100000;

    tf.dispose(batch);

    await tf.nextFrame();
  }
}

async function testDrawing() {
  let drawing = [];
  for (let row = 0; row < drawBoard.pixels.length; row++) {
    drawing.push([]);
    for (let col = 0; col < drawBoard.pixels[row].length; col++) {
      drawing[row].push([drawBoard.pixels[row][col].color / 255]);
    }
  }
  let pred = await predict(drawing);

  let highestIndex = 0;
  let secondIndex = 1;
  for (let i = 0; i < pred.length; i++) {
    if (pred[i] > pred[highestIndex]) {
      secondIndex = highestIndex;
      highestIndex = i;
    } else if (pred[i] > pred[secondIndex]) {
      secondIndex = i;
    }
  }

  let predObj = [];
  for (let i in pred) {
    predObj.push({
      "index": i,
      "pred": pred[i]
    });
  }

  predObj.sort((a, b) => b.pred - a.pred);

  let rows = document.getElementsByClassName("pred");
  for (const i in predObj) {
    let html = "<tr>"
    html += `<td>${Math.round(predObj[i].pred * 10000) / 100}</td>`;
    html += `<td>${predObj[i].index}</td>`;
    rows[i].innerHTML = html;
  }
}

async function predict(img) {
  const x = tf.tensor3d(img).reshape([-1, 28, 28, 1]);
  const response = await model.predict(x);
  let pred = response.dataSync();
  x.dispose();
  return pred;
}

let mouseDown = false;
function startClick(event) {
  mouseDown = true;
  mouse.x = event.clientX - canvas.getBoundingClientRect().left;
  mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  colorPixel(100);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard.draw();
}

function moveClick(event) {
  if (mouseDown) {
    mouse.x = event.clientX - canvas.getBoundingClientRect().left;
    mouse.y = event.clientY - canvas.getBoundingClientRect().top;
    colorPixel(75);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard.draw();
  }
}

function stopClick() {
  mouseDown = false;
}

function resetBoard() {
  drawBoard = new DrawBoard();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard.draw();
}

function colorPixel(strength) {
  for (let row = 0; row < drawBoard.resolution; row++) {
    for (let col = 0; col < drawBoard.resolution; col++) {
      if (
        mouse.x > col * drawBoard.pixelSize &&
        mouse.x < (col + 1) * drawBoard.pixelSize &&
        mouse.y > row * drawBoard.pixelSize &&
        mouse.y < (row + 1) * drawBoard.pixelSize
      ) {
        drawBoard.addColor(row, col, strength);
        drawBoard.addColor(row + 1, col, strength - 35);
        drawBoard.addColor(row + 1, col + 1, strength - 45);
        drawBoard.addColor(row - 1, col, strength - 35);
        drawBoard.addColor(row - 1, col - 1, strength - 45);
        drawBoard.addColor(row, col + 1, strength - 35);
        drawBoard.addColor(row - 1, col + 1, strength - 45);
        drawBoard.addColor(row, col - 1, strength - 35);
        drawBoard.addColor(row + 1, col - 1, strength - 45);
      }
    }
  }
}

let data;
async function loadData() {
  data = new MnistData();
  await data.load();
}

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.28;
  canvas.height = canvas.width;
  drawBoard.resize();
}

resizeCanvas();
main();

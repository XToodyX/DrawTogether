const canvasElement = document.querySelector('#draw');
const ctx = canvasElement.getContext('2d');

ctx.strokeStyle = 'black';
ctx.lineWidth = 5;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawingPath = [];

function draw(e) {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
  drawingPath.push({ x: e.offsetX, y: e.offsetY});
}

function notifyClearCanvas() {
  clearCanvas();
  socket.emit('clearCanvas');
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
}

function setColor(color, selectedButton) {
  ctx.strokeStyle = color;

  const previousSelectedButton = document.querySelector('.color-buttons .selected');

  if (previousSelectedButton) {
    previousSelectedButton.classList.remove('selected')
  }
  selectedButton.classList.add('selected');  
}

canvasElement.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
  drawingPath = [{ x: lastX, y: lastY }];
});

canvasElement.addEventListener('mouseup', () => {
  isDrawing = false;
  socket.emit('drawing', {path: drawingPath, color: ctx.strokeStyle});
});
canvasElement.addEventListener('mouseout', () => isDrawing = false);
canvasElement.addEventListener('mousemove', draw);

// --- Socket logic ---
var socket = io();

socket.emit('new player');

// Handle incoming drawing data from others
socket.on('drawing', ({path, color}) => {
  let previousDrawColor = ctx.strokeStyle;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();

  ctx.strokeStyle = previousDrawColor
});

socket.on('clearCanvas', () => {
  clearCanvas();
})

// Handle disconnection
window.addEventListener('beforeunload', () => {
  socket.emit('disconnect');
});



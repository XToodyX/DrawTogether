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

// --- Connecting with PeerJS ---
var peer = new Peer();

peer.on('open', function(id) {
  const peerConnectionIdContainer = document.createElement('div');
  peerConnectionIdContainer.id = 'peerConnectionIdContainer';

  const peerIdParagraph = document.createElement('p');
  peerIdParagraph.textContent = `Your Peer-ID: ${id}`;
  peerConnectionIdContainer.appendChild(peerIdParagraph);

  const copyPeerIdButton = document.createElement('button');
  copyPeerIdButton.id = 'copyPeerIdButton';
  copyPeerIdButton.onclick = () => copyPeerId(id);
  const copyIcon = document.createElement('img');
  copyIcon.src = 'assets/content-copy.svg';
  copyPeerIdButton.appendChild(copyIcon);

  peerConnectionIdContainer.appendChild(copyPeerIdButton);
  document.body.appendChild(peerConnectionIdContainer);

  console.log('My peer ID is: ' + id);
});

peer.on('connection', function(conn) {
  console.log('CONNECTION FROM OTHER RECEIVED');
  
  conn.on('data', (data) => {
    if (data.type === 'drawing') {
      drawFromData(data.path, data.color);
    } else if (data.type === 'clearCanvas') {
      clearCanvas();
    }
  });
});

function copyPeerId(id) {
  navigator.clipboard.writeText(id).then().catch(err => {
    console.error('Failed to copy peer ID: ', err);
  })
}

function draw(e) {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
  drawingPath.push({ x: e.offsetX, y: e.offsetY });
}

function notifyClearCanvas() {
  clearCanvas();
  sendToPeers({ type: 'clearCanvas' });
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

function setColor(color, selectedButton) {
  ctx.strokeStyle = color;

  const previousSelectedButton = document.querySelector('.color-buttons .selected');

  if (previousSelectedButton) {
    previousSelectedButton.classList.remove('selected');
  }
  selectedButton.classList.add('selected');
}

function joinRoom() {
  let room = document.getElementById('joinRoomInput').value;
  
  if (room) {
    const conn = peer.connect(room);
    conn.on('open', () => {
      console.log('Connected to: ' + room);
      conn.on('data', (data) => {
        if (data.type === 'drawing') {
          drawFromData(data.path, data.color);
        } else if (data.type === 'clearCanvas') {
          clearCanvas();
        }
      });
    });
  }
}

canvasElement.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
  drawingPath = [{ x: lastX, y: lastY }];
});

canvasElement.addEventListener('mouseup', () => {
  isDrawing = false;
  const data = { type: 'drawing', path: drawingPath, color: ctx.strokeStyle };
  sendToPeers(data);
});

canvasElement.addEventListener('mouseout', () => isDrawing = false);
canvasElement.addEventListener('mousemove', draw);

function drawFromData(path, color) {
  let previousDrawColor = ctx.strokeStyle;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();

  ctx.strokeStyle = previousDrawColor;
}

function sendToPeers(data) {
  Object.values(peer.connections).forEach(conns => {
    conns.forEach(conn => {
      conn.send(data);
    });
  });
}

window.addEventListener('beforeunload', () => {
  peer.destroy()
})
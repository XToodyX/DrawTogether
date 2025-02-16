const canvasElement = document.querySelector('#draw');
  const ctx = canvasElement.getContext('2d');

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function draw(e) {
    if (!isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }

  canvasElement.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvasElement.addEventListener('mouseup', () => isDrawing = false);
  canvasElement.addEventListener('mouseout', () => isDrawing = false);
  canvasElement.addEventListener('mousemove', draw);
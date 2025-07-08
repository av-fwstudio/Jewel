
const videoElement = document.getElementById('inputVideo');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

async function main() {
  const faceMesh = new FaceMesh({
    locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/\${file}\`
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(results => {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        for (let i = 0; i < landmarks.length; i++) {
          const x = landmarks[i].x * canvasElement.width;
          const y = landmarks[i].y * canvasElement.height;
          canvasCtx.beginPath();
          canvasCtx.arc(x, y, 1.5, 0, 2 * Math.PI);
          canvasCtx.fillStyle = 'red';
          canvasCtx.fill();
        }
      }
    }
    canvasCtx.restore();
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => await faceMesh.send({image: videoElement}),
    width: 640,
    height: 480
  });
  camera.start();
}

main();

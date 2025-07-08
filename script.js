
let selectedItem = null;
let earringImage = new Image();
earringImage.src = "assets/earring.png";

function selectItem(item) {
  selectedItem = item;
}

const videoElement = document.getElementById('inputVideo');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults(results => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks && selectedItem === 'earring') {
    const landmarks = results.multiFaceLandmarks[0];
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];
    const leftEye = landmarks[133];
    const rightEye = landmarks[362];

    const faceWidth = Math.hypot(
      (rightEye.x - leftEye.x) * canvasElement.width,
      (rightEye.y - leftEye.y) * canvasElement.height
    );
    const earringSize = faceWidth * 0.2;

    [leftEar, rightEar].forEach((ear) => {
      const x = ear.x * canvasElement.width - earringSize / 2;
      const y = ear.y * canvasElement.height - earringSize / 2;
      canvasCtx.drawImage(earringImage, x, y, earringSize, earringSize);
    });
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
  },
  width: 640,
  height: 480
});

camera.start();

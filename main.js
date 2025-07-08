
let scene, camera, renderer, model, videoTexture;
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("output");
const loader = new THREE.GLTFLoader();

// Setup Three.js
function initThree() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, canvasElement.clientWidth / canvasElement.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: canvasElement, alpha: true });
  renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
  camera.position.z = 5;

  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  loader.load("models/earring.glb", function(gltf) {
    model = gltf.scene;
    model.scale.set(0.01, 0.01, 0.01);
    scene.add(model);
  });
}

// Update model with head rotation
function updateModel(rotation) {
  if (model) {
    model.rotation.x = rotation.x;
    model.rotation.y = rotation.y;
    model.rotation.z = rotation.z;
  }
}

// Setup MediaPipe FaceMesh
async function startTracking() {
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
    renderer.render(scene, camera);
    if (results.multiFaceLandmarks[0]) {
      const rigged = Kalidokit.Face.solve(results.multiFaceLandmarks[0], { runtime: "mediapipe" });
      updateModel(rigged.head.degrees);
    }
  });

  const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
  cameraUtils.start();
}

// Start everything
window.onload = () => {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    videoElement.srcObject = stream;
    initThree();
    startTracking();
  });
};

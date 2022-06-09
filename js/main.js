"use strict";
import validated from "./validatesingleton.js";

if (
  location.hostname !== "localhost" &&
  location.hostname !== "127.0.0.1" &&
  location.protocol !== "https:"
) {
  location.replace(
    `https:${location.href.substring(location.protocol.length)}`
  );
}

const start = document.querySelector(".start");
const stop = document.querySelector(".stop");
const restart = document.querySelector(".restart");
const video = document.querySelector(".video");
const loading = document.querySelector(".loading");
const instructions = document.querySelector(".instructions");

const genderEl = document.querySelector("#gender");
const genderProbEl = document.querySelector("#genderProbability");
const ageEl = document.querySelector("#age");
const expressionEl = document.querySelector("#expression");
const expressionProbEl = document.querySelector("#expressionProbability");

let startAnalysis = false;

restart.addEventListener("click", () => window.location.reload());

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  //faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models"),
])
  .then(() =>
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    })
  )
  .then((cameraStream) => {
    video.srcObject = cameraStream;
  })
  .catch((err) => {
    //console.error(err);
    loading.innerText = `Error!  ${err}`;
  });

video.addEventListener("playing", () => {
  const predictedAges = [];
  loading.classList.remove("active");

  // async function uploadImage(blob) {
  //   const fd = new FormData();
  //   fd.append("system", "FacialAI");
  //   fd.append("capturedImage", blob, "FacialAIBlob");
  //   const resp = await fetch("./upload/", {
  //     method: "POST",
  //     body: fd,
  //   });
  //   const data = await resp.json();
  //   //console.log(data);
  // }

  start.addEventListener("click", (e) => {
    startAnalysis = true;
    canvas.classList.add("active");
    instructions.classList.add("active");
    predictedAges.length = 0;

    //   const captureCanvas = document.querySelector(".captureCanvas");
    //   captureCanvas.width = video.videoWidth;
    //   captureCanvas.height = video.videoHeight;
    //   captureCanvas
    //     .getContext("2d")
    //     .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    //   captureCanvas.toBlob((blob) => uploadImage(blob));
  });

  stop.addEventListener("click", (e) => {
    startAnalysis = false;
    canvas.classList.remove("active");
  });

  const canvas = faceapi.createCanvasFromMedia(video);
  canvas.classList.add("canvas");
  video.parentNode.insertBefore(canvas, video.nextSibling);

  const displaySize = {
    width: +window.getComputedStyle(video).width.slice(0, -2),
    height: +window.getComputedStyle(video).height.slice(0, -2),
  };

  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    function interpolateAgePredictions(age) {
      if (predictedAges.unshift(age) >= 31) {
        predictedAges.length = 30;
      }
      return (
        predictedAges.reduce((total, a) => total + a) / predictedAges.length
      );
    }

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      //.withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    if (validated.get() && startAnalysis && resizedDetections.length > 0) {
      const { gender, genderProbability, age, expressions } =
        resizedDetections[0];

      const interpolatedAge = interpolateAgePredictions(age);
      const exprkeys = Object.keys(expressions);
      const largestExpression = exprkeys.sort(
        (a, b) => expressions[a] - expressions[b]
      )[exprkeys.length - 1];

      genderEl.innerText = gender.toUpperCase();
      genderProbEl.innerText = `${Math.round(100 * genderProbability)}%`;
      ageEl.innerText = `${Math.round(interpolatedAge, 1)} years old`;
      expressionEl.innerText = largestExpression.toUpperCase();
      expressionProbEl.innerText = `${Math.round(
        100 * expressions[largestExpression]
      )}%`;
    }
  }, 100);
});

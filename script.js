
const heightOfPhone = 15.5


const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

var scanBy = [];

var fruits = ["banana", "apple", "orange", "carrot"];
var drinks = ["bottle", "cup"]
var utensils = ["fork", "knife", "spoon", "scissors"]
var book = "book"
var electronics = ["laptop", "cell phone"]
var vehicle = ["car", "motorcycle", "bus", ""]


var msg = new SpeechSynthesisUtterance();
var predictions;

let lastsaid = ""
let lastsentence = ""

let SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;

var model = undefined;



// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  
  // Hide the button once clicked.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

// Store the resulting model in the global scope of our app.
var model = undefined;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  demosSection.classList.remove('invisible');
  speechToText();
});

var children = [];

function predictWebcam() {
  model.detect(video).then(function (predictions) {
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    draw(predictions)
    this.predictions = predictions;
    window.requestAnimationFrame(predictWebcam);
  });
}

function draw(predictions){
  for (let n = 0; n < predictions.length; n++) {
    // If we are over 66% sure we are sure we classified it right, draw it!
    if (predictions[n].score > 0.66) {
      console.log(scanBy);
      if(scanBy.length==0){
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
  
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';
  
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      } 
      else if(scanBy.includes(predictions[n].class)){
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
  
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';
  
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
  }
}

function getVoices() {
  let voices = speechSynthesis.getVoices();
  if(!voices.length){
    // some time the voice will not be initialized so we can call spaek with empty string
    // this will initialize the voices 
    let utterance = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(utterance);
    voices = speechSynthesis.getVoices();
  }
  return voices;
}



let pass = 0;

function speechToText() {
  try {
      recognition = new SpeechRecognition();
      recognition.lang = 'en';
      recognition.interimResults = true;
      //recordBtn.classList.add("recording");
      //recordBtn.querySelector("p").innerHTML = "Listening...";
      recognition.start();



      recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript;


          lastsaid = speechResult.split(" ").pop();
          lastsentence = speechResult.split(".").pop().toLowerCase();

          //to solve the repeating error
          console.log(lastsaid);
          if (lastsaid == ("fruits")) {
            scanBy = fruits
          }

          else if (lastsaid == ("utensils")) {
            scanBy = utensils
          }

          else if (lastsaid == ("drinks")) {
            scanBy = drinks
          }

          else if (lastsaid == ("off")) {
            scanBy = []
          }
          else if(lastsaid == ("thing") && pass== 0){
            pass++;
            msg.text = predictions[0].class;
            window.speechSynthesis.speak(msg);
            const temp = setInterval(() => {
              pass++;
              if (pass == 100) {
                pass = 0;
                clearInterval(temp);
              }
            }, 5);
          }


          lastsentence = ""
          lastsaid = ""

          //detect when intrim results
          if (event.results[0].isFinal) {
              result.innerHTML += " " + speechResult;
              result.querySelector("p").remove();
          } else {
              //creative p with class interim if not already there
              if (!document.querySelector(".interim")) {
                  const interim = document.createElement("p");
                  interim.classList.add("interim");
                  result.appendChild(interim);
              }
              //update the interim p with the speech result
              document.querySelector(".interim").innerHTML = " " + speechResult;
          }
      };
      recognition.onspeechend = () => {
        speechToText();
    };
  } catch (error) {
      recording = false;
      console.log(error);
  }
}


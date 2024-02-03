var url_input_element = document.getElementById('url-input');
var filename_element = document.getElementById('filename');
var play_button = document.getElementById('play');
var stop_button = document.getElementById('stop');
var record_button = document.getElementById('record');
var stop_record_button = document.getElementById('stop-record');
var url = url_input_element.value;
var filename = filename_element.value;
var audio;
var recorded_chunks = [];
var media_recorder;
function play() {
    console.log('play');
    url = url_input_element.value;
    audio = new Audio(url);
    audio.play();
}
function stop_cb() {
    console.log('stop');
    audio.pause();
    audio.currentTime = 0;
}
function record() {
    console.log('record');
    audio = new Audio(url);
    media_recorder = new MediaRecorder(audio.mozCaptureStream());
    media_recorder.ondataavailable = function (event) { return recorded_chunks.push(event.data); };
    media_recorder.start();
    console.log("".concat(media_recorder.state));
}
function stop_record() {
    console.log('stop rec');
}
console.log("".concat(url, ", ").concat(filename));

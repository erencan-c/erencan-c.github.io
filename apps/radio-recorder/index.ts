const url_input_element = document.getElementById('url-input') as HTMLInputElement;
const filename_element = document.getElementById('filename') as HTMLInputElement;

const play_button = document.getElementById('play') as HTMLButtonElement;
const stop_button = document.getElementById('stop') as HTMLButtonElement;
const record_button = document.getElementById('record') as HTMLButtonElement;
const stop_record_button = document.getElementById('stop-record') as HTMLButtonElement;

let url = url_input_element.value;
let filename = filename_element.value;
let audio: HTMLAudioElement;

let recorded_chunks = [];
let media_recorder;

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
	media_recorder = new MediaRecorder(audio.mozCaptureStream()) as MediaRecorder;
	media_recorder.ondataavailable = event => recorded_chunks.push(event.data);
	media_recorder.start();
	console.log(`${media_recorder.state}`);
}

function stop_record() {
	console.log('stop rec');
}

console.log(`${url}, ${filename}`);

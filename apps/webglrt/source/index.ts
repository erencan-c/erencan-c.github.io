import { ShaderProgram } from "./shader-program.js";
import { Buffer } from "./buffer.js";
import { Scene } from "./scene.js";
import { angleAxis, applyTransformation, cross, matmul, rotationMatrix, scaleVector, translate } from "./math.js"

let t = 0.0;

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let shader: ShaderProgram;
const planePositions = new Float32Array([
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
]);
let plane: Buffer;
const _vertexShader = await getFile('./source/vertex.glsl');
const _fragmentShader = await getFile('./source/fragment.glsl');
let _scene_data_string = await getFile('./source/cornellbox.xml');
let dom_parser = new DOMParser();
let scene_data = dom_parser.parseFromString(_scene_data_string, 'application/xml');
let scene: Scene;
const fps_counter = document.querySelector('#fps-counter') as HTMLInputElement;
const scene_file_picker = document.querySelector('#scene-file') as HTMLInputElement;
const transparency = document.querySelector('#transparency') as HTMLInputElement;
let fileChanged = false;
//console.log(_scene_data_string);

function init() {
    canvas = document.getElementById('screen') as HTMLCanvasElement;
    const _gl = canvas.getContext('webgl2');
    if (_gl === null) {
        alert('WebGL2 is not supported in this browser or device or some other error');
        throw new Error("WebGL2 is not supported or some other error");
    }
    gl = _gl;
    scene = new Scene(gl, scene_data);
    shader = new ShaderProgram(gl, _vertexShader, _fragmentShader, scene);
    plane = new Buffer(gl, planePositions, shader);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	shader.use(gl);
	scene.sendScene(gl, shader);
	plane.draw(gl, shader);
	requestAnimationFrame(draw);
}

let previous_time = 0.0;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    g: false,
    q: false,
    e: false,
    r: false,
    f: false,
};
const SPEED = 0.01;
const ROTATION = 0.04;

let running = false;

function draw(now) {
	let dt = now - previous_time;
	previous_time = now;
	t += dt/1e3;
	fps_counter.value = (1e3/dt).toString();
	gl.uniform1f(shader.getUniformLocation(gl, 't'), t);
	scene.sendScene(gl, shader);
	plane.draw(gl, shader);
    
    let rightVector = cross(scene.camera.gaze, scene.camera.up);

    scene.camera.position = translate(scene.camera.position, scaleVector(scene.camera.gaze, SPEED*dt*(Number(keys.w) - Number(keys.s))));
    scene.camera.position = translate(scene.camera.position, scaleVector(rightVector, SPEED*dt*(Number(keys.d) - Number(keys.a))));
    
    scene.camera.gaze = applyTransformation(angleAxis(scene.camera.up, ROTATION*(Number(keys.q) - Number(keys.e))), scene.camera.gaze);
    scene.camera.gaze = applyTransformation(angleAxis(rightVector, ROTATION*(Number(keys.r) - Number(keys.f))), scene.camera.gaze);
    scene.camera.up = applyTransformation(angleAxis(rightVector, ROTATION*(Number(keys.r) - Number(keys.f))), scene.camera.up);

    if(running)
	    requestAnimationFrame(draw);
}

async function getFile(path: string): Promise<string> {
    const res = await fetch(path);
    const data = await res.text();
    return data;
}

document.addEventListener('keydown', event => {
    if(event.key == 'g') {
        running = !running;
        if(running) {
            requestAnimationFrame(draw);
        }
    }
    keys[event.key] = true;
});

document.addEventListener('keyup', event => {
    keys[event.key] = false;
})

transparency.onchange = event => {
    console.log(scene.materials);
    scene.materials.refractRatio[9] = parseFloat(transparency.value)/100;
    scene.materials.refractRatio[10] = scene.materials.refractRatio[9];
    scene.materials.refractRatio[11] = scene.materials.refractRatio[9];
};

scene_file_picker.onchange = event => {
    //@ts-ignore
    let file: Blob = event.target.files[0];

    let reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    
    reader.onload = readerEvent => {
        _scene_data_string = readerEvent.target.result.toString();
        dom_parser = new DOMParser();
        scene_data = dom_parser.parseFromString(_scene_data_string, 'application/xml');
        scene = new Scene(gl, scene_data);
        shader = new ShaderProgram(gl, _vertexShader, _fragmentShader, scene);
        fileChanged = true;
        transparency.disabled = true;
        console.log(scene);
    };
};

init();

import { ShaderProgram } from "./shader-program.js";
import { Buffer } from "./buffer.js";
import { Scene } from "./scene.js";

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
let scene = new Scene(gl, scene_data);
let fps_counter = document.querySelector('#fps-counter') as HTMLInputElement;
console.log(_scene_data_string);

function init() {
    canvas = document.getElementById('screen') as HTMLCanvasElement;
    const _gl = canvas.getContext('webgl2');
    if (_gl === null) {
        alert('WebGL2 is not supported in this browser or device');
        throw new Error("WebGL2 is not supported");
    }
    gl = _gl;
    shader = new ShaderProgram(gl, _vertexShader, _fragmentShader);
    plane = new Buffer(gl, planePositions, shader);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	shader.use(gl);
	scene.send_scene(gl, shader);
	plane.draw(gl, shader);
	requestAnimationFrame(draw);
}

let previous_time = 0.0;

function draw(now) {
	let dt = now - previous_time;
	previous_time = now;
	t += dt/1e3;
	fps_counter.value = (1e3/dt).toString();
	gl.uniform1f(shader.getUniformLocation(gl, 't'), t);
	scene.send_scene(gl, shader);
	plane.draw(gl, shader);
	// requestAnimationFrame(draw);
}

async function getFile(path: string): Promise<string> {
    const res = await fetch(path);
    const data = await res.text();
    return data;
}

init();

import { ShaderProgram } from "./shader-program.js";
import { Buffer } from "./buffer.js";

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

function init() {
    console.log('aaa');
    canvas = document.getElementById('screen') as HTMLCanvasElement;
    const _gl = canvas.getContext('webgl2');
    if(_gl === null) {
        alert('WebGL2 is not supported in this browser or device');
        throw new Error("WebGL2 is not supported");
    }
    gl = _gl;
    shader = new ShaderProgram(gl, _vertexShader, _fragmentShader);
    plane = new Buffer(gl, planePositions, shader);

    gl.uniform1f(shader.getUniformLocation(gl, 't'), t);
    t += 0.1;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    plane.draw(gl, shader);
}

async function getFile(path: string): Promise<string> {
    const res = await fetch(path);
    const data = await res.text();
    return data;
}

init();

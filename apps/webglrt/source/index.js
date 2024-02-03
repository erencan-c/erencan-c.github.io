"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var shader_program_js_1 = require("./shader-program.js");
var buffer_js_1 = require("./buffer.js");
var scene_js_1 = require("./scene.js");
var math_js_1 = require("./math.js");
var t = 0.0;
var canvas;
var gl;
var shader;
var planePositions = new Float32Array([
    1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    -1.0, -1.0,
]);
var plane;
var _vertexShader = await getFile('./source/vertex.glsl');
var _fragmentShader = await getFile('./source/fragment.glsl');
var _scene_data_string = await getFile('./source/cornellbox.xml');
var dom_parser = new DOMParser();
var scene_data = dom_parser.parseFromString(_scene_data_string, 'application/xml');
var scene;
var fps_counter = document.querySelector('#fps-counter');
var scene_file_picker = document.querySelector('#scene-file');
var transparency = document.querySelector('#transparency');
var eta = document.querySelector('#eta');
var transparencyValue = document.querySelector('#transparency-value');
var etaValue = document.querySelector('#eta-value');
var startStop = document.querySelector('#start-stop');
var transparencyContainer = document.querySelector('#transparency-container');
var etaContainer = document.querySelector('#eta-container');
var fileChanged = false;
//console.log(_scene_data_string);
function init() {
    canvas = document.getElementById('screen');
    var _gl = canvas.getContext('webgl2');
    if (_gl === null) {
        alert('WebGL2 is not supported in this browser or device or some other error');
        throw new Error("WebGL2 is not supported or some other error");
    }
    gl = _gl;
    scene = new scene_js_1.Scene(gl, scene_data);
    shader = new shader_program_js_1.ShaderProgram(gl, _vertexShader, _fragmentShader, scene);
    plane = new buffer_js_1.Buffer(gl, planePositions, shader);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    shader.use(gl);
    scene.sendScene(gl, shader);
    plane.draw(gl, shader);
    requestAnimationFrame(draw);
}
var previous_time = 0.0;
var keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    g: false,
    q: false,
    e: false,
    r: false,
    f: false,
    Shift: false,
    ' ': false,
};
var SPEED = 0.01;
var ROTATION = 0.04;
var running = false;
function draw(now) {
    var dt = now - previous_time;
    previous_time = now;
    t += dt / 1e3;
    fps_counter.value = (1e3 / dt).toString();
    gl.uniform1f(shader.getUniformLocation(gl, 't'), t);
    scene.sendScene(gl, shader);
    plane.draw(gl, shader);
    var rightVector = (0, math_js_1.cross)(scene.camera.gaze, scene.camera.up);
    scene.camera.position = (0, math_js_1.translate)(scene.camera.position, (0, math_js_1.scaleVector)(scene.camera.gaze, SPEED * dt * (Number(keys.w) - Number(keys.s))));
    scene.camera.position = (0, math_js_1.translate)(scene.camera.position, (0, math_js_1.scaleVector)(rightVector, SPEED * dt * (Number(keys.d) - Number(keys.a))));
    scene.camera.position = (0, math_js_1.translate)(scene.camera.position, (0, math_js_1.scaleVector)(scene.camera.up, SPEED * dt * (Number(keys[' ']) - Number(keys.Shift))));
    scene.camera.gaze = (0, math_js_1.applyTransformation)((0, math_js_1.angleAxis)(scene.camera.up, ROTATION * (Number(keys.q) - Number(keys.e))), scene.camera.gaze);
    scene.camera.gaze = (0, math_js_1.applyTransformation)((0, math_js_1.angleAxis)(rightVector, ROTATION * (Number(keys.r) - Number(keys.f))), scene.camera.gaze);
    scene.camera.up = (0, math_js_1.applyTransformation)((0, math_js_1.angleAxis)(rightVector, ROTATION * (Number(keys.r) - Number(keys.f))), scene.camera.up);
    if (running)
        requestAnimationFrame(draw);
}
function getFile(path) {
    return __awaiter(this, void 0, void 0, function () {
        var res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(path)];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.text()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
document.addEventListener('keydown', function (event) {
    if (event.key == 'g') {
        running = !running;
        startStop.innerHTML = running ? "Running" : "Stopped";
        if (running) {
            requestAnimationFrame(draw);
            startStop.style.color = '#007F00';
        }
        else {
            startStop.style.color = '#7F0000';
        }
    }
    console.log(event.key);
    if (event.key === ' ' || event.key === 'Shift') {
        event.preventDefault();
    }
    keys[event.key] = true;
});
document.addEventListener('keyup', function (event) {
    if (event.key === ' ' || event.key === 'Shift') {
        event.preventDefault();
    }
    keys[event.key] = false;
});
transparency.onchange = function (event) {
    console.log(scene.materials);
    scene.materials.refractRatio[9] = parseFloat(transparency.value) / 100;
    scene.materials.refractRatio[10] = scene.materials.refractRatio[9];
    scene.materials.refractRatio[11] = scene.materials.refractRatio[9];
    transparencyValue.innerHTML = scene.materials.refractRatio[9].toString();
};
eta.onchange = function (event) {
    scene.materials.refract[3] = (parseFloat(eta.value) + 1.0) / 25.0;
    etaValue.innerHTML = scene.materials.refract[3].toString();
};
scene_file_picker.onchange = function (event) {
    //@ts-ignore
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = function (readerEvent) {
        _scene_data_string = readerEvent.target.result.toString();
        dom_parser = new DOMParser();
        scene_data = dom_parser.parseFromString(_scene_data_string, 'application/xml');
        scene = new scene_js_1.Scene(gl, scene_data);
        shader = new shader_program_js_1.ShaderProgram(gl, _vertexShader, _fragmentShader, scene);
        fileChanged = true;
        transparency.disabled = true;
        transparencyContainer.hidden = true;
        eta.disabled = true;
        etaContainer.hidden = true;
        console.log(scene);
    };
};
init();

'use strict'

import { ShaderProgram } from "./shader-program.js";
import { Buffer } from "./buffer.js";
let canvas;
let gl;
let shader;
let t = 0.0;
const planePositions = new Float32Array([
    1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    -1.0, -1.0,
]);
let plane;
const _vertexShader = await getFile('./source/vertex.glsl');
const _fragmentShader = await getFile('./source/fragment.glsl');
let _scene_data_string = await getFile('./source/cornellbox.xml');
let dom_parser = new DOMParser();
let scene_data = dom_parser.parseFromString(_scene_data_string, 'application/xml');
let scene = create_scene_object(scene_data);
let fps_counter = document.querySelector('#fps-counter');
console.log(_scene_data_string);

function create_scene_object(xml_object) {
	let obj = {}
	obj.background_color = new Float32Array(xml_object.querySelector('BackgroundColor').innerHTML.trim().split(/\s+/).map(parseFloat));
	obj.shadow_ray_epsilon = parseFloat(xml_object.querySelector('ShadowRayEpsilon').innerHTML.trim());
	obj.max_recursion_depth = parseFloat(xml_object.querySelector('MaxRecursionDepth').innerHTML.trim());
	
	let cam = xml_object.querySelector('Camera');
	obj.camera = {
		'position': new Float32Array(cam.querySelector('Position').innerHTML.trim().split(/\s+/).map(parseFloat)),
		'gaze': new Float32Array(cam.querySelector('Gaze').innerHTML.trim().split(/\s+/).map(parseFloat)),
		'up': new Float32Array(cam.querySelector('Up').innerHTML.trim().split(/\s+/).map(parseFloat)),
		'near_plane': new Float32Array(cam.querySelector('NearPlane').innerHTML.trim().split(/\s+/).map(parseFloat)),
		'near_distance': parseFloat(cam.querySelector('NearDistance').innerHTML.trim()),
	}
	
	let lights = xml_object.querySelector('Lights');
	obj.ambient_light = new Float32Array(lights.querySelector('AmbientLight').innerHTML.trim().split(/\s+/).map(parseFloat));
	let light_positions = [];
	let light_intensities = [];
	lights.querySelectorAll('PointLight').forEach(light => {
		let pos = light.querySelector('Position').innerHTML.trim().split(/\s+/).map(parseFloat);
		let inten = light.querySelector('Intensity').innerHTML.trim().split(/\s+/).map(parseFloat);
		light_positions.push(pos[0]);
		light_positions.push(pos[1]);
		light_positions.push(pos[2]);
		light_intensities.push(inten[0]);
		light_intensities.push(inten[1]);
		light_intensities.push(inten[2]);
	});
	obj.light_positions = new Float32Array(light_positions);
	obj.light_intensities = new Float32Array(light_intensities);
	
	let materials = xml_object.querySelector('Materials');
	let ambient_reflectances = [];
	let diffuse_reflectances = [];
	let specular_reflectances = [];
	let reflectances = [];
	let refractances = [];
	let refractance_ratios = [];
	let phong_exponents = [];
	materials.querySelectorAll('Material').forEach(material => {
		let ambient = material.querySelector('AmbientReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
		let diffuse = material.querySelector('DiffuseReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
		let specular = material.querySelector('SpecularReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
		let reflect = material.querySelector('MirrorReflectance').innerHTML.trim().split(/\s+/).map(parseFloat);
		let refract = parseFloat(material.querySelector('Refractance').innerHTML.trim());
		let refract_ratio = material.querySelector('RefractanceRatio').innerHTML.trim().split(/\s+/).map(parseFloat);
		let phong = parseFloat(material.querySelector('PhongExponent').innerHTML.trim());
		
		ambient_reflectances.push(ambient[0]);
		ambient_reflectances.push(ambient[1]);
		ambient_reflectances.push(ambient[2]);
		diffuse_reflectances.push(diffuse[0]);
		diffuse_reflectances.push(diffuse[1]);
		diffuse_reflectances.push(diffuse[2]);
		specular_reflectances.push(specular[0]);
		specular_reflectances.push(specular[1]);
		specular_reflectances.push(specular[2]);
		reflectances.push(reflect[0]);
		reflectances.push(reflect[1]);
		reflectances.push(reflect[2]);
		refractance_ratios.push(refract_ratio[0]);
		refractance_ratios.push(refract_ratio[1]);
		refractance_ratios.push(refract_ratio[2]);
		refractances.push(refract);
		phong_exponents.push(phong);
	});
	obj.materials = {
		'ambient': new Float32Array(ambient_reflectances),
		'diffuse': new Float32Array(diffuse_reflectances),
		'specular': new Float32Array(specular_reflectances),
		'reflect': new Float32Array(reflectances),
		'refract': new Float32Array(refractances),
		'refract_ratio': new Float32Array(refractance_ratios),
		'phong': new Float32Array(phong_exponents)
	};
	
	obj.vertices = new Float32Array (xml_object.querySelector('VertexData').innerHTML.trim().split(/\s+/).map(parseFloat));
	
	let material_ids = [
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		2,
		2
	];
	let vertex_ids = [
		1, 2, 6,
        6, 5, 1,
		5, 6, 7,
		7, 8, 5,
		7, 3, 4,
		4, 8, 7,
		8, 4, 1,
		8, 1, 5,
		2, 3, 7,
		2, 7, 6
	];
	
	let vertices = [];
	vertex_ids.forEach(id => {
		vertices.push(obj.vertices[3*(id-1)]);
		vertices.push(obj.vertices[3*(id-1) + 1]);
		vertices.push(obj.vertices[3*(id-1) + 2]);
	});
	
	obj.vertices = new Float32Array(vertices);
	obj.material_ids = new Int32Array(material_ids);
	
	let sphere_materials = [3,4];
	let sphere_centers = [5,-6,-1, -5,-6,-5];
	let sphere_radii = [4,4];
	
	obj.sphere_materials = new Int32Array(sphere_materials);
	obj.sphere_centers = new Float32Array(sphere_centers);
	obj.sphere_radii = new Float32Array(sphere_radii);
	
	return obj;
}

function send_scene(scene) {
	gl.uniform3f(shader.getUniformLocation(gl, 'ambient_light'),
		scene.ambient_light[0],
		scene.ambient_light[1],
		scene.ambient_light[2]
	);
	
	gl.uniform3f(shader.getUniformLocation(gl, 'background_color'),
		scene.background_color[0],
		scene.background_color[1],
		scene.background_color[2]
	);
	
	gl.uniform3f(shader.getUniformLocation(gl, 'camera.gaze'),
		scene.camera.gaze[0],
		scene.camera.gaze[1],
		scene.camera.gaze[2]
	);
	
	gl.uniform1f(shader.getUniformLocation(gl, 'camera.near_distance'),
		scene.camera.near_distance
	);
	
	gl.uniform4f(shader.getUniformLocation(gl, 'camera.near_plane'),
		scene.camera.near_plane[0],
		scene.camera.near_plane[1],
		scene.camera.near_plane[2],
		scene.camera.near_plane[3]
	);
	
	gl.uniform3f(shader.getUniformLocation(gl, 'camera.position'),
		scene.camera.position[0],
		scene.camera.position[1],
		scene.camera.position[2]
	);
	
	gl.uniform3f(shader.getUniformLocation(gl, 'camera.up'),
		scene.camera.up[0],
		scene.camera.up[1],
		scene.camera.up[2]
	);
	
	gl.uniform3fv(shader.getUniformLocation(gl, 'light_intensities'), scene.light_intensities);
	gl.uniform3fv(shader.getUniformLocation(gl, 'light_positions'), scene.light_positions);
	
	gl.uniform3fv(shader.getUniformLocation(gl, 'material_ambient'), scene.materials.ambient);
	gl.uniform3fv(shader.getUniformLocation(gl, 'material_diffuse'), scene.materials.diffuse);
	gl.uniform1fv(shader.getUniformLocation(gl, 'material_phong'), scene.materials.phong);
	gl.uniform3fv(shader.getUniformLocation(gl, 'material_reflect'), scene.materials.reflect);
	gl.uniform1fv(shader.getUniformLocation(gl, 'material_refract'), scene.materials.refract);
	gl.uniform3fv(shader.getUniformLocation(gl, 'material_refract_ratios'), scene.materials.refract_ratio);
	gl.uniform3fv(shader.getUniformLocation(gl, 'material_specular'), scene.materials.specular);
	
	gl.uniform3fv(shader.getUniformLocation(gl, 'vertices'), scene.vertices);
	
	gl.uniform1iv(shader.getUniformLocation(gl, 'material_ids'), scene.material_ids);
	
	gl.uniform1iv(shader.getUniformLocation(gl, 'sphere_materials'), scene.sphere_materials);
	gl.uniform3fv(shader.getUniformLocation(gl, 'sphere_centers'), scene.sphere_centers);
	gl.uniform1fv(shader.getUniformLocation(gl, 'sphere_radii'), scene.sphere_radii);
}

function init() {
    canvas = document.getElementById('screen');
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
	send_scene(scene);
	plane.draw(gl, shader);
	requestAnimationFrame(draw);
}

let previous_time = 0.0;

function draw(now) {
	let dt = now - previous_time;
	previous_time = now;
	t += dt/1e3;
	fps_counter.value = 1e3/dt;
	gl.uniform1f(shader.getUniformLocation(gl, 't'), t);
	send_scene(scene);
	plane.draw(gl, shader);
	requestAnimationFrame(draw);
}

async function getFile(path) {
    const res = await fetch(path, {cache: 'no-store'});
    const data = await res.text();
    return data;
}

init();
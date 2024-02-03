import { Shader } from './Shader.js';
import { Mesh } from './Mesh.js';
import { Camera } from './Camera.js';
import * as math from './math.js';

// Note that loading the source files synchronously like this is actually not good for
// the performance. However, waiting for loading with a black screen is not that of
// an improvement compared to waiting the browser to load the files. For really better
// performance, directly embedding the shader files is actually better. However, module
// system already decreases the performance, so seperating shaders should not cause
// too much of a problem. Also, this codebase is not meant to be fast.
const meshVertexShaderSource = await (await fetch('../shader/mesh.vs')).text();
const meshFragmentShaderSource = await (await fetch('../shader/mesh.fs')).text();
const meshShader = new Shader(meshVertexShaderSource, meshFragmentShaderSource);

export class Scene {
	camera: Camera;
	meshes: Array<Mesh>;
	constructor(camera: Camera, meshes: Array<Mesh>) {
		this.meshes = meshes;
		this.camera = camera;
	}

	render() {
		// Bind (or actually use) the shader program, it will be used for every mesh in the scene.
		meshShader.bind();

		// Get the camera matrix. Note that the `Camera.getMatrix` method creates the view times projection
		// matrix, not a single of them.
		const viewProjection = this.camera.getMatrix();

		meshShader.sendMat4('viewProjection', viewProjection);
		meshShader.sendVec3('lightColor', new Float32Array([10, 10, 10]));
		meshShader.sendVec3('cameraPosition', this.camera.position);
		for (const mesh of this.meshes) {
			meshShader.sendVec3('lightPosition', math.add(new Float32Array([1, -mesh.translation[1], 4]), mesh.translation));
			mesh.render(meshShader);
		}
		meshShader.unbind();
	}
}
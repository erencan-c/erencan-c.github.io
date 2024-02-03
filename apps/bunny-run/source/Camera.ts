import * as math from './math.js';

export class Camera {
	position: math.Vec3;
	direction: math.Vec3;
	fov: number;
	aspectRatio: number;
	near: number;
	far: number;

	constructor(position: math.Vec3, direction: math.Vec3, fov: number, aspectRatio: number, near: number, far: number) {
		this.position = position;
		this.direction = direction;
		this.fov = fov;
		this.aspectRatio = aspectRatio;
		this.near = near;
		this.far = far;
	}

	getMatrix(): Float32Array {
		// The multiplication order should be the opposite. However, the incompatibility of
		// our matrices and OpenGL matrices is probably the reason of the error here.
		return math.matmul(
			math.view(this.position, this.direction),
			math.perspective(this.fov, this.aspectRatio, this.near, this.far),
		);
	}
}